import { RawDataDocumentModel } from '@service/raw-data/interface';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import VisualAdministrativeCountryLogic from '@service/visual/administrative/country/VisualAdministrativeCountryLogic';
import VisualAdministrativeProvinceLogic from '@service/visual/administrative/province/VisualAdministrativeProvinceLogic';
import VisualAdministrativeDistrictLogic from '@service/visual/administrative/district/VisualAdministrativeDistrictLogic';
import VisualAdministrativeWardLogic from '@service/visual/administrative/ward/VisualAdministrativeWardLogic';
import RawDataLogic from '@service/raw-data/RawDataLogic';
import { DOCUMENT_LIMIT } from '@background-job/child-processes/clean-data/constant';

interface AddressRawDataset {
    _id: number;
    address: string;
}

const rawDataLogic = RawDataLogic.getInstance();

const _deleteInvalidAddress = async ({
    _id,
    address,
}: AddressRawDataset): Promise<void> => {
    await rawDataLogic.delete(_id);
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Clean data - Invalid address -> RID: ${_id} - ${address}`
    ).show();
};

/**
 * Delete data which have address not contain district or ward
 */
export const deleteInvalidAddress = async (
    script: AsyncGenerator
): Promise<void> => {
    const countryPattern = (
        await VisualAdministrativeCountryLogic.getInstance().getAll({})
    ).documents
        .map((country) => country.name)
        .join('|');
    const provincePattern = (
        await VisualAdministrativeProvinceLogic.getInstance().getAll({})
    ).documents
        .map((province) => province.name)
        .join('|');
    const districtPattern = (
        await VisualAdministrativeDistrictLogic.getInstance().getAll({})
    ).documents
        .map((district) => district.name)
        .join('|');
    const wards: string[] = (
        await VisualAdministrativeWardLogic.getInstance().getAll({})
    ).documents.map((ward) => ward.name);
    const wardPattern = wards
        .filter((ward, index) => wards.lastIndexOf(ward) === index)
        .join('|');
    const validDistrictAndWardPattern = RegExp(
        `(${wardPattern}).*(${districtPattern})`,
        'i'
    );
    const validProvincePattern = RegExp(`(${provincePattern})`, 'i');
    const validCountryPattern = RegExp(`(${countryPattern})$`, 'i');
    let offset = 0;
    const queryConditions = {
        offset,
        limit: DOCUMENT_LIMIT,
        conditions: {
            coordinateId: undefined,
        },
    };
    let rawDataset: AddressRawDataset[] = (
        await rawDataLogic.getAll(queryConditions)
    ).documents.map(
        ({ _id, address }): AddressRawDataset =>
            Object({
                _id,
                address,
            })
    );

    while (rawDataset.length > 0) {
        for (const rawData of rawDataset) {
            try {
                let { address } = rawData;
                if (!validDistrictAndWardPattern.test(address)) {
                    await _deleteInvalidAddress(rawData);
                    offset--;
                    continue;
                }
                address = address.replace(
                    RegExp(`.*(${wardPattern}).*(${districtPattern})`, 'i'),
                    ''
                );

                if (address.length > 0 && !validProvincePattern.test(address)) {
                    await _deleteInvalidAddress(rawData);
                    offset--;
                    continue;
                }
                address = address.replace(
                    RegExp(`.*(${provincePattern})`, 'i'),
                    ''
                );

                if (address.length > 0 && !validCountryPattern.test(address)) {
                    await _deleteInvalidAddress(rawData);
                    offset--;
                }
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Clean data - Invalid address -> RID: ${rawData._id} - Error: ${error.message}`
                ).show();
                offset--;
            }
        }

        offset += DOCUMENT_LIMIT;
        queryConditions.offset = offset;
        rawDataset = (await rawDataLogic.getAll(queryConditions)).documents;
    }

    script.next();
};
