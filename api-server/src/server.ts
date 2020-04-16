import * as bodyParser from 'body-parser';
import cors from 'cors';
import App from './app';
import RawData from './services/raw-data/raw-data.index';
import Host from './services/host/host.index';
import Catalog from './services/catalog/catalog.index';
import Pattern from './services/pattern/pattern.index';
import DetailUrl from './services/detail-url/detail-url.index';
import requestLogger from './middleware/request-logger/request-logger';
import GroupedData from './services/grouped-data/grouped-data.index';
import initEnv from './util/environment/environment';
import DatabaseMongodb from './services/database/mongodb/database.mongodb';

/**
 * Main
 */
(async (): Promise<void> => {
    initEnv();
    const mongoDbInstance: DatabaseMongodb = DatabaseMongodb.getInstance();
    const appInstance: App = App.getInstance();

    await mongoDbInstance.connect();
    await appInstance.start(
        [cors(), bodyParser.json(), bodyParser.urlencoded({ extended: true }), requestLogger],
        [
            new Host.Controller(),
            new Catalog.Controller(),
            new Pattern.Controller(),
            new DetailUrl.Controller(),
            new RawData.Controller(),
            new GroupedData.Controller(),
        ]
    );
})();
