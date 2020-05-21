import initEnv from './util/environment/environment';
import DatabaseMongodb from './service/database/mongodb/database.mongodb';
import { VisualizationMapPointDocumentModel } from './service/visualization/map-point/visualization.map-point.interface';
import { VisualizationDistrictDocumentModel } from './service/visualization/district/visualization.district.interface';
import provinceData from './util/data-initialization/province.json';
import districtData from './util/data-initialization/district.json';
import wardData from './util/data-initialization/ward.json';
import ConsoleLog from './util/console/console.log';
import ConsoleConstant from './util/console/console.constant';
import VisualizationProvinceModel from './service/visualization/province/visualization.province.model';
import VisualizationDistrictModel from './service/visualization/district/visualization.district.model';
import VisualizationWardModel from './service/visualization/ward/visualization.ward.model';

(async () => {
    initEnv();
    await DatabaseMongodb.getInstance().connect();

    // import province
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Import province data - Start').show();
    for (const item of provinceData) {
        if ((await VisualizationProvinceModel.countDocuments({ code: item.code })) === 0) {
            await VisualizationProvinceModel.create({ name: item.name, code: item.code, acreage: item.acreage });
            new ConsoleLog(ConsoleConstant.Type.INFO, `Import province data -> ${item.name} - ${item.code}`).show();
        }
    }
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Import province data - Done').show();

    // import district
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Import district data - Start').show();
    for (const item of districtData) {
        const provinceCode: string = item.code.split('_')[0];
        const provinceId: number = (((await VisualizationProvinceModel.findOne({
            code: provinceCode,
        })) as unknown) as VisualizationMapPointDocumentModel)._id;

        if ((await VisualizationDistrictModel.countDocuments({ code: item.code })) === 0) {
            await VisualizationDistrictModel.create({
                name: item.name,
                provinceId,
                code: item.code,
                acreage: item.acreage,
            });
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Import district data - PID: ${provinceId} - ${item.name} - ${item.code}`
            ).show();
        }
    }
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Import district data - Done').show();

    // import ward
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Import ward data - Start').show();
    for (const item of wardData) {
        const districtCode = `${item.code.split('_')[0]}_${item.code.split('_')[1]}`;
        const districtId: number = ((await VisualizationDistrictModel.findOne({
            code: districtCode,
        })) as VisualizationDistrictDocumentModel)._id;

        if ((await VisualizationWardModel.countDocuments({ code: item.code })) === 0) {
            await VisualizationWardModel.create({
                name: item.name,
                code: item.code,
                districtId,
            });
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Import ward data - DID: ${districtId} - ${item.name} - ${item.code}`
            ).show();
        }
    }
    new ConsoleLog(ConsoleConstant.Type.INFO, 'Import ward data - Done').show();
    process.exit(0);
})();
