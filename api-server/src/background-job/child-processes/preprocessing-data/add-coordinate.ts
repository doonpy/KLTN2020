import { VisualAdministrativeDistrictDocumentModel } from '@service/visual/administrative/district/interface';
import { VisualAdministrativeWardDocumentModel } from '@service/visual/administrative/ward/interface';
import { removeSpecialCharacterAtHeadAndTail } from '@util/helper/string';
import { CoordinateDocumentModel } from '@service/coordinate/interface';
import { getGeocode } from '@util/external-api/map';
import CoordinateLogic from '@service/coordinate/CoordinateLogic';
import VisualAdministrativeDistrictLogic from '@service/visual/administrative/district/VisualAdministrativeDistrictLogic';
import VisualAdministrativeWardLogic from '@service/visual/administrative/ward/VisualAdministrativeWardLogic';

export type AddressProperties = {
    district?: VisualAdministrativeDistrictDocumentModel;
    ward?: VisualAdministrativeWardDocumentModel;
};

/**
 * Get address properties from origin address
 *
 * @param {string} address
 *
 * @return {AddressProperties}
 */
export const getAddressProperties = async (
    address: string
): Promise<AddressProperties> => {
    const visualAdministrativeDistrictLogic = VisualAdministrativeDistrictLogic.getInstance();
    const visualAdministrativeWardLogic = VisualAdministrativeWardLogic.getInstance();
    const districtPattern = (
        await visualAdministrativeDistrictLogic.getAll({})
    ).documents
        .map(({ name }) => name)
        .sort((a, b) => b.length - a.length)
        .filter((name, index, array) => index === array.lastIndexOf(name))
        .join('|');
    const addressClone = removeSpecialCharacterAtHeadAndTail(
        address.replace(/^.*(đường|phố)[^,]*,/gi, '')
    );
    const districtName =
        addressClone
            .replace(/^.*(phường|xã)[^,]*,/gi, '')
            .match(RegExp(districtPattern, 'ig'))
            ?.shift() || '';
    const district = await visualAdministrativeDistrictLogic.getOne({
        name: districtName,
    });

    if (!district) {
        return {};
    }

    const wardList: VisualAdministrativeWardDocumentModel[] = (
        await visualAdministrativeWardLogic.getAll({
            conditions: { districtId: district._id },
        })
    ).documents;
    const wardNames = wardList
        .map(({ name }) => name)
        .sort((a, b) => b.length - a.length);
    const wardPattern = wardNames
        .filter((name, index) => index === wardNames.lastIndexOf(name))
        .join('|');
    const wardName =
        addressClone
            .replace(districtName, '')
            .match(RegExp(wardPattern))
            ?.shift() || '';
    const ward = await visualAdministrativeWardLogic.getOne({ name: wardName });

    if (!ward) {
        return { district };
    }

    return {
        district,
        ward,
    };
};

/**
 * Get coordinate of certain address
 *
 * @param {string} address
 *
 * @return {Promise<CoordinateDocumentModel | undefined>}
 */
export const getCoordinate = async (
    address: string
): Promise<CoordinateDocumentModel | undefined> => {
    const coordinateLogic = CoordinateLogic.getInstance();
    let coordinateDoc = await coordinateLogic.getByLocation(address);
    if (!coordinateDoc) {
        const apiResponse = await getGeocode(address);
        if (!apiResponse) {
            return undefined;
        }

        if (
            !apiResponse.resourceSets ||
            apiResponse.resourceSets.length === 0
        ) {
            return undefined;
        }

        if (
            !apiResponse.resourceSets[0] ||
            apiResponse.resourceSets[0].resources.length === 0
        ) {
            return undefined;
        }

        const [
            lat,
            lng,
        ] = apiResponse.resourceSets[0].resources[0].point.coordinates;

        coordinateDoc = await coordinateLogic.create({
            location: address,
            lat,
            lng,
        } as CoordinateDocumentModel);
    }

    return coordinateDoc;
};
