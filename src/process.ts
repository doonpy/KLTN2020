import sendRequest from './util/send-request';
import DetailUrlScrape from './worker/scrape/detail-url/detail-url.scrape';
import DatabaseConnection from './modules/database/database';

const runBackgroundJobs = (): void => {
    new DetailUrlScrape(2).start();
};
runBackgroundJobs();
