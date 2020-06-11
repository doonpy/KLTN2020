import './prepend';
import { VisualAdministrativeDistrictDocumentModel } from '@service/visual/administrative/district/interface';
import countryData from '@util/data-initialization/countries.json';
import provinceData from '@util/data-initialization/provinces.json';
import districtData from '@util/data-initialization/districts.json';
import wardData from '@util/data-initialization/wards.json';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import { VisualAdministrativeWardDocumentModel } from '@service/visual/administrative/ward/interface';
import { VisualAdministrativeCountryDocumentModel } from '@service/visual/administrative/country/interface';
import VisualAdministrativeDistrictLogic from '@service/visual/administrative/district/VisualAdministrativeDistrictLogic';
import VisualAdministrativeCountryLogic from '@service/visual/administrative/country/VisualAdministrativeCountryLogic';
import VisualAdministrativeProvinceLogic from '@service/visual/administrative/province/VisualAdministrativeProvinceLogic';
import VisualAdministrativeWardLogic from '@service/visual/administrative/ward/VisualAdministrativeWardLogic';
import { VisualAdministrativeProvinceDocumentModel } from '@service/visual/administrative/province/interface';
import VisualSummaryDistrictLogic from '@service/visual/summary/district/VisualSummaryDistrictLogic';
import VisualSummaryDistrictWardLogic from '@service/visual/summary/district-ward/VisualSummaryDistrictWardLogic';
import { VisualSummaryDistrictDocumentModel } from '@service/visual/summary/district/interface';
import { VisualSummaryDistrictWardDocumentModel } from '@service/visual/summary/district-ward/interface';

let script: AsyncGenerator;
const visualAdministrativeCountryLogic = VisualAdministrativeCountryLogic.getInstance();
const visualAdministrativeProvinceLogic = VisualAdministrativeProvinceLogic.getInstance();
const visualAdministrativeDistrictLogic = VisualAdministrativeDistrictLogic.getInstance();
const visualAdministrativeWardLogic = VisualAdministrativeWardLogic.getInstance();
const visualSummaryDistrictLogic = VisualSummaryDistrictLogic.getInstance();
const visualSummaryDistrictWardLogic = VisualSummaryDistrictWardLogic.getInstance();
const PROPERTY_TYPE_AMOUNT = 12;
const TRANSACTION_TYPE_AMOUNT = 2;

/**
 * Initialize province, district and ward data
 */
const importData = async (): Promise<void> => {
    // Import country data
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        'Initialize country data...'
    ).show();
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
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        'Initialize province data...'
    ).show();
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
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        'Initialize district data...'
    ).show();
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
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Initialize ward data...').show();
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

    script.next();
};

/**
 * Initialize data for visualization
 */
const initializeVisualData = async (): Promise<void> => {
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        'Initialize visualization data...'
    ).show();

    const summaryDefault: Array<{
        transactionType: number;
        propertyType: number;
        amount: number;
    }> = [];
    for (let i = 1; i < TRANSACTION_TYPE_AMOUNT; i++) {
        for (let j = 1; j < PROPERTY_TYPE_AMOUNT; j++) {
            summaryDefault.push({
                transactionType: i,
                propertyType: j,
                amount: 0,
            });
        }
    }

    const districtList = (await visualAdministrativeDistrictLogic.getAll({}))
        .documents;
    for (const district of districtList) {
        if (
            !(await visualSummaryDistrictLogic.isExists({
                districtId: district._id,
            }))
        ) {
            await visualSummaryDistrictLogic.create({
                districtId: district._id,
                summaryAmount: 0,
                summary: summaryDefault,
            } as VisualSummaryDistrictDocumentModel);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Initialize visualization data - Summary district - DID: ${district._id}`
            ).show();
        }

        const wardList = (
            await visualAdministrativeWardLogic.getAll({
                conditions: {
                    districtId: district._id,
                },
            })
        ).documents;
        for (const ward of wardList) {
            if (
                !(await visualSummaryDistrictWardLogic.isExists({
                    districtId: district._id,
                    wardId: ward._id,
                }))
            ) {
                await visualSummaryDistrictWardLogic.create({
                    districtId: district._id,
                    wardId: ward._id,
                    summaryAmount: 0,
                    summary: summaryDefault,
                } as VisualSummaryDistrictWardDocumentModel);
            }
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Initialize visualization data - Summary district ward - DID: ${district._id} - WID: ${ward._id}`
            ).show();
        }
    }

    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        'Initialize visualization data - Done'
    ).show();
};

/**
 * Generate script
 */
async function* generateScript() {
    await importData();
    yield 'Step 1: Initialize data';

    await initializeVisualData();
    process.exit(0);
    return 'Done';
}

/**
 * Main
 */
(async () => {
    script = generateScript();
    script.next();
})();
