import initEnv from '@util/environment/environment';
import DatabaseMongodb from '@service/database/mongodb/database.mongodb';
import { VisualMapPointDocumentModel } from '@service/visual/map-point/visual.map-point.interface';
import { VisualDistrictDocumentModel } from '@service/visual/administrative/district/visual.district.interface';
import countryData from '@util/data-initialization/countries.json';
import provinceData from '@util/data-initialization/provinces.json';
import districtData from '@util/data-initialization/districts.json';
import wardData from '@util/data-initialization/wards.json';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import VisualizationCountryModel from '@service/visual/administrative/country/visual.country.model';
import VisualizationProvinceModel from '@service/visual/administrative/province/visual.province.model';
import VisualizationDistrictModel from '@service/visual/administrative/district/visual.district.model';
import VisualizationWardModel from '@service/visual/administrative/ward/visual.ward.model';
import VisualizationSummaryDistrictModel from '@service/visual/summary/district/visual.summary.district.model';
import VisualizationSummaryDistrictWardModel from '@service/visual/summary/district-ward/visual.summary.district-ward.model';
import { VisualWardDocumentModel } from '@service/visual/administrative/ward/visual.ward.interface';
import { VisualCountryDocumentModel } from '@service/visual/administrative/country/visual.country.interface';

let script: AsyncGenerator;
const PROPERTY_TYPE_AMOUNT = 12;
const TRANSACTION_TYPE_AMOUNT = 2;

/**
 * Initialize province, district and ward data
 */
const importData = async (): Promise<void> => {
    // Import country data
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Initialize country data...').show();
    for (const item of countryData) {
        if ((await VisualizationCountryModel.countDocuments({ code: item.code })) === 0) {
            await VisualizationCountryModel.create({ name: item.name, code: item.code, acreage: item.acreage });
            new ConsoleLog(ConsoleConstant.Type.INFO, `Initialize country data -> ${item.name} - ${item.code}`).show();
        }
    }
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Initialize country data - Done').show();

    // Import province data
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Initialize province data...').show();
    for (const item of provinceData) {
        const countryCode: string = item.code.split('_')[0];
        const countryId: number = (((await VisualizationCountryModel.findOne({
            code: countryCode,
        })) as unknown) as VisualCountryDocumentModel)._id;

        if ((await VisualizationProvinceModel.countDocuments({ code: item.code })) === 0) {
            await VisualizationProvinceModel.create({
                name: item.name,
                code: item.code,
                countryId,
                acreage: item.acreage,
            });
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Initialize province data -> CID: ${countryId} - ${item.name} - ${item.code}`
            ).show();
        }
    }
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Initialize province data - Done').show();

    // Import district data
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Initialize district data...').show();
    for (const item of districtData) {
        const countryCode: string = item.code.split('_')[0];
        const provinceCode: string = item.code.split('_')[1];
        const provinceId: number = (((await VisualizationProvinceModel.findOne({
            code: `${countryCode}_${provinceCode}`,
        })) as unknown) as VisualMapPointDocumentModel)._id;

        if ((await VisualizationDistrictModel.countDocuments({ code: item.code })) === 0) {
            await VisualizationDistrictModel.create({
                name: item.name,
                provinceId,
                code: item.code,
                acreage: item.acreage,
            });
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Initialize district data - PID: ${provinceId} - ${item.name} - ${item.code}`
            ).show();
        }
    }
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Initialize district data - Done').show();

    // Import ward data
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Initialize ward data...').show();
    for (const item of wardData) {
        const countryCode: string = item.code.split('_')[0];
        const provinceCode: string = item.code.split('_')[1];
        const districtCode: string = item.code.split('_')[2];
        const districtId: number = ((await VisualizationDistrictModel.findOne({
            code: `${countryCode}_${provinceCode}_${districtCode}`,
        })) as VisualDistrictDocumentModel)._id;

        if ((await VisualizationWardModel.countDocuments({ code: item.code })) === 0) {
            await VisualizationWardModel.create({
                name: item.name,
                code: item.code,
                districtId,
            });
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Initialize ward data - DID: ${districtId} - ${item.name} - ${item.code}`
            ).show();
        }
    }
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Initialize ward data - Done').show();

    script.next();
};

/**
 * Initialize data for visualization
 */
const initializeVisualData = async (): Promise<void> => {
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Initialize visualization data...').show();

    const summaryDefault: { transactionType: number; propertyType: number; amount: number }[] = [];
    for (let i = 0; i < TRANSACTION_TYPE_AMOUNT; i++) {
        for (let j = 0; j < PROPERTY_TYPE_AMOUNT; j++) {
            summaryDefault.push({ transactionType: i, propertyType: j, amount: 0 });
        }
    }

    const districtList: VisualDistrictDocumentModel[] = await VisualizationDistrictModel.find();
    for (const district of districtList) {
        const isSummaryDistrictExist: number = await VisualizationSummaryDistrictModel.countDocuments({
            districtId: district._id,
        });
        if (!isSummaryDistrictExist) {
            await VisualizationSummaryDistrictModel.create({
                districtId: district._id,
                summaryAmount: 0,
                summary: summaryDefault,
            });
        }

        const wardList: VisualWardDocumentModel[] = await VisualizationWardModel.find({
            districtId: district._id,
        });
        for (const ward of wardList) {
            const isSummaryDistrictWardExist: number = await VisualizationSummaryDistrictWardModel.countDocuments({
                districtId: district._id,
                wardId: ward._id,
            });
            if (!isSummaryDistrictWardExist) {
                await VisualizationSummaryDistrictWardModel.create({
                    districtId: district._id,
                    wardId: ward._id,
                    summaryAmount: 0,
                    summary: summaryDefault,
                });
            }
        }
    }

    new ConsoleLog(ConsoleConstant.Type.INFO, 'Initialize visualization data - Done').show();
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
    initEnv();
    await DatabaseMongodb.getInstance().connect();

    script = generateScript();
    script.next();
})();
