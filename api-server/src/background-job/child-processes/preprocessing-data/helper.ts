import { VisualAdministrativeDistrictDocumentModel } from '@service/visual/administrative/district/interface';
import { VisualAdministrativeWardDocumentModel } from '@service/visual/administrative/ward/interface';
import VisualAdministrativeDistrictLogic from '@service/visual/administrative/district/VisualAdministrativeDistrictLogic';
import VisualAdministrativeWardLogic from '@service/visual/administrative/ward/VisualAdministrativeWardLogic';
import { removeSpecialCharacterAtHeadAndTail } from '@util/helper/string';

export interface IdAddressProperties {
    districtId: number;
    wardId: number;
}

export type AddressProperties = {
    district?: VisualAdministrativeDistrictDocumentModel;
    ward?: VisualAdministrativeWardDocumentModel;
};

/**
 * Get address properties from origin address
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
        name: { $regex: RegExp(`^${districtName}$`, 'ig') },
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
            .match(RegExp(wardPattern, 'ig'))
            ?.shift() || '';
    const ward = await visualAdministrativeWardLogic.getOne({
        name: { $regex: RegExp(`^${wardName}$`, 'ig') },
        districtId: district._id,
    });

    if (!ward) {
        return { district };
    }

    return {
        district,
        ward,
    };
};
