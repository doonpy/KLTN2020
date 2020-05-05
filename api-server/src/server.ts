import * as bodyParser from 'body-parser';
import cors from 'cors';
import App from './app';
import requestLogger from './middleware/request-logger/request-logger';
import initEnv from './util/environment/environment';
import DatabaseMongodb from './service/database/mongodb/database.mongodb';
import HostController from './service/host/host.controller';
import CatalogController from './service/catalog/catalog.controller';
import PatternController from './service/pattern/pattern.controller';
import DetailUrlController from './service/detail-url/detail-url.controller';
import RawDataController from './service/raw-data/raw-data.controller';
import GroupedDataController from './service/grouped-data/grouped-data.controller';

/**
 * Main
 */
(async (): Promise<void> => {
    initEnv();
    await DatabaseMongodb.getInstance().connect();
    await App.getInstance().start(
        [cors(), bodyParser.json(), bodyParser.urlencoded({ extended: true }), requestLogger],
        [
            HostController.getInstance(),
            CatalogController.getInstance(),
            PatternController.getInstance(),
            DetailUrlController.getInstance(),
            RawDataController.getInstance(),
            GroupedDataController.getInstance(),
        ]
    );
})();
