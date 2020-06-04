import './prepend';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import requestLogger from '@middleware/request-logger/request-logger';
import HostController from '@service/host/host.controller';
import CatalogController from '@service/catalog/catalog.controller';
import PatternController from '@service/pattern/pattern.controller';
import DetailUrlController from '@service/detail-url/detail-url.controller';
import RawDataController from '@service/raw-data/raw-data.controller';
import GroupedDataController from '@service/grouped-data/grouped-data.controller';
import VisualSummaryDistrictController from '@service/visual/summary/district/visual.summary.district.controller';
import VisualAdministrativeCountryController from '@service/visual/administrative/country/visual.administrative.country.controller';
import VisualAdministrativeProvinceController from '@service/visual/administrative/province/visual.administrative.province.controller';
import VisualAdministrativeDistrictController from '@service/visual/administrative/district/visual.administrative.district.controller';
import VisualAdministrativeWardController from '@service/visual/administrative/ward/visual.administrative.ward.controller';
import VisualSummaryDistrictWardController from '@service/visual/summary/district-ward/visual.summary.district-ward.controller';
import VisualMapPointController from '@service/visual/map-point/visual.map-point.controller';
import VisualAnalysisController from '@service/visual/analysis/visual.analysis.controller';
import App from './app';

/**
 * Main
 */
(async (): Promise<void> => {
    await App.getInstance().start(
        [
            cors(),
            bodyParser.json(),
            bodyParser.urlencoded({ extended: true }),
            requestLogger,
        ],
        [
            HostController.getInstance(),
            CatalogController.getInstance(),
            PatternController.getInstance(),
            DetailUrlController.getInstance(),
            RawDataController.getInstance(),
            GroupedDataController.getInstance(),
            VisualAdministrativeCountryController.getInstance(),
            VisualAdministrativeProvinceController.getInstance(),
            VisualAdministrativeDistrictController.getInstance(),
            VisualAdministrativeWardController.getInstance(),
            VisualSummaryDistrictController.getInstance(),
            VisualSummaryDistrictWardController.getInstance(),
            VisualMapPointController.getInstance(),
            VisualAnalysisController.getInstance(),
        ]
    );
})();
