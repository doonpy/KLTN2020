import './prepend';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import requestLogger from '@middleware/request-logger/request-logger';
import HostController from '@service/host/HostController';
import CatalogController from '@service/catalog/CatalogController';
import PatternController from '@service/pattern/PatternController';
import DetailUrlController from '@service/detail-url/DetailUrlController';
import RawDataController from '@service/raw-data/RawDataController';
import GroupedDataController from '@service/grouped-data/GroupedDataController';
import VisualSummaryDistrictController from '@service/visual/summary/district/VisualSummaryDistrictController';
import VisualAdministrativeCountryController from '@service/visual/administrative/country/VisualAdministrativeCountryController';
import VisualAdministrativeProvinceController from '@service/visual/administrative/province/VisualAdministrativeProvinceController';
import VisualAdministrativeDistrictController from '@service/visual/administrative/district/VisualAdministrativeDistrictController';
import VisualAdministrativeWardController from '@service/visual/administrative/ward/VisualAdministrativeWardController';
import VisualSummaryDistrictWardController from '@service/visual/summary/district-ward/VisualSummaryDistrictWardController';
import VisualMapPointController from '@service/visual/map-point/VisualMapPointController';
import VisualAnalyticsController from '@service/visual/analytics/VisualAnalyticsController';
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
            VisualAnalyticsController.getInstance(),
        ]
    );
})();
