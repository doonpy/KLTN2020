import './prepend';
import * as bodyParser from 'body-parser';
import cors from 'cors';
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
import { App } from './App';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

const initDefaultFolder = (): void => {
    const staticFolder = process.env.STATIC_FOLDER;
    const reviewFolder = process.env.REVIEW_FOLDER;
    if (!staticFolder || !reviewFolder) {
        throw new Error('Static folder or review folder is invalid!');
    }
    if (!fs.existsSync(staticFolder)) {
        fs.mkdirSync(staticFolder);
    }
    if (!fs.existsSync(reviewFolder)) {
        fs.mkdirSync(reviewFolder);
    }
};

/**
 * Main
 */
((): void => {
    initDefaultFolder();
    new App({
        protocol: process.env.API_SERVER_PROTOCOL ?? '',
        domain: process.env.API_SERVER_DOMAIN ?? '',
        port: process.env.API_SERVER_PORT ?? '',
        middlewares: [
            bodyParser.json(),
            bodyParser.urlencoded({ extended: true }),
            morgan('dev'),
            cors(),
        ],
        controllers: [
            {
                cPath: '/api/v1',
                controllers: [
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
                ],
            },
        ],
        staticPath: path.join(__dirname, './public'),
    }).start();
})();
