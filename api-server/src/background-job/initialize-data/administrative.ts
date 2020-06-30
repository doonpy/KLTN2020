import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import countryData from '@background-job/initialize-data/data/countries.json';
import { VisualAdministrativeCountryDocumentModel } from '@service/visual/administrative/country/interface';
import provinceData from '@background-job/initialize-data/data/provinces.json';
import { VisualAdministrativeProvinceDocumentModel } from '@service/visual/administrative/province/interface';
import districtData from '@background-job/initialize-data/data/districts.json';
import { VisualAdministrativeDistrictDocumentModel } from '@service/visual/administrative/district/interface';
import wardData from '@background-job/initialize-data/data/wards.json';
import { VisualAdministrativeWardDocumentModel } from '@service/visual/administrative/ward/interface';
import VisualAdministrativeCountryLogic from '@service/visual/administrative/country/VisualAdministrativeCountryLogic';
import VisualAdministrativeProvinceLogic from '@service/visual/administrative/province/VisualAdministrativeProvinceLogic';
import VisualAdministrativeDistrictLogic from '@service/visual/administrative/district/VisualAdministrativeDistrictLogic';
import VisualAdministrativeWardLogic from '@service/visual/administrative/ward/VisualAdministrativeWardLogic';

/**
 * Initialize province, district and ward data
 */
export const initAdministrativeData = async (): Promise<void> => {
    const visualAdministrativeCountryLogic = VisualAdministrativeCountryLogic.getInstance();
    const visualAdministrativeProvinceLogic = VisualAdministrativeProvinceLogic.getInstance();
    const visualAdministrativeDistrictLogic = VisualAdministrativeDistrictLogic.getInstance();
    const visualAdministrativeWardLogic = VisualAdministrativeWardLogic.getInstance();

    // Import country data
    for (const item of countryData) {
        if (
            !(await visualAdministrativeCountryLogic.isExists({
                code: item.code,
            }))
        ) {
            await visualAdministrativeCountryLogic.create({
                name: item.name,
                code: item.code,
                acreage: item.acreage,
            } as VisualAdministrativeCountryDocumentModel);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Initialize country data -> ${item.name} - ${item.code}`
            ).show();
        }
    }
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        'Initialize country data - Done'
    ).show();

    // Import province data
    for (const item of provinceData) {
        const countryCode = item.code.split('_')[0];
        const countryId = (
            await visualAdministrativeCountryLogic.getOne({
                code: countryCode,
            })
        )?._id;

        if (
            !(await visualAdministrativeProvinceLogic.isExists({
                code: item.code,
            }))
        ) {
            await visualAdministrativeProvinceLogic.create({
                name: item.name,
                code: item.code,
                countryId,
                acreage: item.acreage,
            } as VisualAdministrativeProvinceDocumentModel);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Initialize province data -> CID: ${countryId} - ${item.name} - ${item.code}`
            ).show();
        }
    }
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        'Initialize province data - Done'
    ).show();

    // Import district data
    for (const item of districtData) {
        const countryCode = item.code.split('_')[0];
        const provinceCode = item.code.split('_')[1];
        const provinceId = (
            await visualAdministrativeProvinceLogic.getOne({
                code: `${countryCode}_${provinceCode}`,
            })
        )?._id;

        if (
            !(await visualAdministrativeDistrictLogic.isExists({
                code: item.code,
            }))
        ) {
            await visualAdministrativeDistrictLogic.create({
                name: item.name,
                provinceId,
                code: item.code,
                acreage: item.acreage,
            } as VisualAdministrativeDistrictDocumentModel);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Initialize district data - PID: ${provinceId} - ${item.name} - ${item.code}`
            ).show();
        }
    }
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        'Initialize district data - Done'
    ).show();

    // Import ward data
    for (const item of wardData) {
        const countryCode = item.code.split('_')[0];
        const provinceCode = item.code.split('_')[1];
        const districtCode = item.code.split('_')[2];
        const districtId = (
            await visualAdministrativeDistrictLogic.getOne({
                code: `${countryCode}_${provinceCode}_${districtCode}`,
            })
        )?._id;

        if (
            !(await visualAdministrativeWardLogic.isExists({
                code: item.code,
            }))
        ) {
            await visualAdministrativeWardLogic.create({
                name: item.name,
                code: item.code,
                districtId,
            } as VisualAdministrativeWardDocumentModel);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Initialize ward data - DID: ${districtId} - ${item.name} - ${item.code}`
            ).show();
        }
    }
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        'Initialize ward data - Done'
    ).show();
};
