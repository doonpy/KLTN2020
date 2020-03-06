import { BgrScrape } from './bgr-job/scrape/scrape.index';
import { Catalog } from './services/catalog/catalog.index';
import { BgrQueue } from './bgr-job/queue/queue.index';
import { Database } from './services/database/database.index';
import * as dotenv from 'dotenv';
import ChatBotTelegram from './services/chatbot/chatBotTelegram';
import DateTime from './util/datetime/datetime';
import ConsoleLog from './util/console/console.log';
import { ConsoleConstant } from './util/console/console.constant';
dotenv.config();

const SCHEDULE_TIME_HOUR: number = parseInt(process.env.SCHEDULE_TIME_HOUR || '0'); // hour
const SCHEDULE_TIME_MINUTE: number = parseInt(process.env.SCHEDULE_TIME_MINUTE || '0'); // minute
const SCHEDULE_TIME_SECOND: number = parseInt(process.env.SCHEDULE_TIME_SECOND || '0'); // second

/**
 * Script of background job.
 */
const script = (): void => {
    let jobQueue: BgrQueue.Job = new BgrQueue.Job();

    setInterval(async (): Promise<void> => {
        let expectTime: Date = new Date();
        expectTime.setHours(SCHEDULE_TIME_HOUR);
        expectTime.setMinutes(SCHEDULE_TIME_MINUTE);
        expectTime.setSeconds(SCHEDULE_TIME_SECOND);
        if (!DateTime.isExactTime(expectTime)) {
            return;
        }

        jobQueue.exportLog();

        let catalogIdList = (await new Catalog.Logic().getAll()).catalogs.map(catalog => {
            return catalog._id;
        });

        for (const catalogId of catalogIdList) {
            let scrapeDetailUrlJob: BgrScrape.DetailUrl = new BgrScrape.DetailUrl(catalogId);
            jobQueue.pushElement(scrapeDetailUrlJob.start.bind(scrapeDetailUrlJob));
        }

        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Start background job. Remain tasks: ${jobQueue.getRemainTask()}`
        ).show();

        if (!jobQueue.isRunning) {
            await jobQueue.start();
        }
    }, 1000);
};

new Database.MongoDb().connect().then((): void => {
    new ChatBotTelegram();
    script();
});
