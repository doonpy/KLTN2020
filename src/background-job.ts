import { BgrScrape } from './bgr-job/scrape/scrape.index';
import { Catalog } from './services/catalog/catalog.index';
import { BgrQueue } from './bgr-job/queue/queue.index';
import { Database } from './services/database/database.index';
import * as dotenv from 'dotenv';
import ChatBotTelegram from './services/chatbot/chatBotTelegram';
import DateTime from './util/datetime/datetime';
import ConsoleLog from './util/console/console.log';
import { ConsoleConstant } from './util/console/console.constant';
import ConsoleTable from './util/console/console.table';
dotenv.config();

const SCHEDULE_TIME_HOUR: number = parseInt(process.env.SCHEDULE_TIME_HOUR || '0'); // hour
const SCHEDULE_TIME_MINUTE: number = parseInt(process.env.SCHEDULE_TIME_MINUTE || '0'); // minute
const SCHEDULE_TIME_SECOND: number = parseInt(process.env.SCHEDULE_TIME_SECOND || '0'); // second
const THREAD_AMOUNT: number = parseInt(process.env.THREAD_AMOUNT || '1');

/**
 * Initialize job queue list
 */
const initJobQueueList = (): Array<BgrQueue.Job> => {
    let jobQueueList: Array<BgrQueue.Job> = [];
    for (let i: number = 0; i < THREAD_AMOUNT; i++) {
        let jobQueue: BgrQueue.Job = new BgrQueue.Job(i);
        jobQueueList.push(jobQueue);
    }

    return jobQueueList;
};

const displayConsole = (jobQueueList: Array<BgrQueue.Job>): void => {
    console.clear();
    let infoTable: Array<object> = jobQueueList.map((jobQueue, index): any => {
        return {
            threadIndex: index,
            remainTasks: jobQueue.getRemainElements(),
            status: jobQueue.isRunning,
        };
    });
    new ConsoleLog(ConsoleConstant.Type.INFO, `Background job process...`).show();
    new ConsoleTable(infoTable).show();
};

/**
 * Script of background job.
 */
const script = async (): Promise<void> => {
    let jobQueueList: Array<BgrQueue.Job> = initJobQueueList();

    setInterval(async (): Promise<void> => {
        displayConsole(jobQueueList);

        let expectTime: Date = new Date();
        expectTime.setHours(SCHEDULE_TIME_HOUR);
        expectTime.setMinutes(SCHEDULE_TIME_MINUTE);
        expectTime.setSeconds(SCHEDULE_TIME_SECOND);
        if (!DateTime.isExactTime(expectTime, true)) {
            return;
        }

        let catalogIdList = (await new Catalog.Logic().getAll()).catalogs.map(catalog => {
            return catalog._id;
        });

        for (const catalogId of catalogIdList) {
            let scrapeDetailUrlJob: BgrScrape.DetailUrl = new BgrScrape.DetailUrl(catalogId);
            let threadIndex: number = catalogId % THREAD_AMOUNT;
            jobQueueList[threadIndex].pushElement(scrapeDetailUrlJob);
        }

        for (const jobQueue of jobQueueList) {
            if (!jobQueue.isRunning) {
                jobQueue.start();
            }
        }
    }, 1000);
};

new Database.MongoDb().connect().then(
    async (): Promise<void> => {
        new ChatBotTelegram();
        try {
            await script();
        } catch (error) {
            ChatBotTelegram.sendMessage(
                `<b>🤖[Background Job]🤖 ❌ ERROR ❌</b>\n→ Message: <code>${error.message}</code>`
            );
            throw error;
        }
    }
);
