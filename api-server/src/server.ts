import 'module-alias/register';
import '@root/prepend';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import requestLogger from '@middleware/request-logger/request-logger';
import HostController from '@service/host/host.controller';
import CatalogController from '@service/catalog/catalog.controller';
import PatternController from '@service/pattern/pattern.controller';
import DetailUrlController from '@service/detail-url/detail-url.controller';
import RawDataController from '@service/raw-data/raw-data.controller';
import GroupedDataController from '@service/grouped-data/grouped-data.controller';
import VisualizationSummaryDistrictController from '@service/visualization/summary/district/visualization.summary.district.controller';
import VisualizationProvinceController from '@service/visualization/administrative/province/visualization.province.controller';
import VisualizationDistrictController from '@service/visualization/administrative/district/visualization.district.controller';
import VisualizationWardController from '@service/visualization/administrative/ward/visualization.ward.controller';
import VisualizationSummaryDistrictWardController from '@service/visualization/summary/district-ward/visualization.summary.district-ward.controller';
import VisualizationMapPointController from '@service/visualization/map-point/visualization.map-point.controller';
import App from '@root/app';

/**
 * Main
 */
(async (): Promise<void> => {
    await App.getInstance().start(
        [cors(), bodyParser.json(), bodyParser.urlencoded({ extended: true }), requestLogger],
        [
            HostController.getInstance(),
            CatalogController.getInstance(),
            PatternController.getInstance(),
            DetailUrlController.getInstance(),
            RawDataController.getInstance(),
            GroupedDataController.getInstance(),
            VisualizationProvinceController.getInstance(),
            VisualizationDistrictController.getInstance(),
            VisualizationWardController.getInstance(),
            VisualizationSummaryDistrictController.getInstance(),
            VisualizationSummaryDistrictWardController.getInstance(),
            VisualizationMapPointController.getInstance(),
        ]
    );
})();
