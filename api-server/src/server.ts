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
import DateTime from './util/datetime/datetime';
import BackgroundJob from './background-job/main';

/**
 * Background job
 */
const startBackgroundJob = (): void => {
    const checkTimeLoop: NodeJS.Timeout = setInterval(async (): Promise<void> => {
        const expectTime: Date = new Date();
        expectTime.setUTCHours(parseInt(process.env.SCHEDULE_TIME_HOUR || '0', 10));
        expectTime.setUTCMinutes(parseInt(process.env.SCHEDULE_TIME_MINUTE || '0', 10));
        expectTime.setUTCSeconds(parseInt(process.env.SCHEDULE_TIME_SECOND || '0', 10));
        if (!DateTime.isExactTime(expectTime, true) || BackgroundJob.isBgrJobRunning()) {
            return;
        }

        await BackgroundJob.main();
    }, 1000);
};

/**
 * Main
 */
(async (): Promise<void> => {
    initEnv();
    const mongoDbInstance: DatabaseMongodb = DatabaseMongodb.getInstance();
    const appInstance: App = App.getInstance();

    await mongoDbInstance.connect();
    startBackgroundJob();
    await BackgroundJob.main();
    await appInstance.start(
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
