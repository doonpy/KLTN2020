import { BgrScrape } from './scrape/scrape.index';
import { Catalog } from '../services/catalog/catalog.index';
import { BgrQueue } from './queue/queue.index';
import { Database } from '../services/database/database.index';
import * as dotenv from 'dotenv';
import ChatBotTelegram from '../services/chatbot/chatBotTelegram';
import ConsoleLog from '../util/console/console.log';
import { ConsoleConstant } from '../util/console/console.constant';
import DateTime from '../util/datetime/datetime';
import initSocketServer from './socket.io';

dotenv.config();

const SCHEDULE_TIME_HOUR: number = parseInt(process.env.SCHEDULE_TIME_HOUR || '0'); // hour
const SCHEDULE_TIME_MINUTE: number = parseInt(process.env.SCHEDULE_TIME_MINUTE || '0'); // minute
const SCHEDULE_TIME_SECOND: number = parseInt(process.env.SCHEDULE_TIME_SECOND || '0'); // second
const SCHEDULE_TIME_DELAY_HOUR: number = parseInt(process.env.SCHEDULE_TIME_DELAY_HOUR || '0'); // hour
const SCHEDULE_TIME_DELAY_MINUTE: number = parseInt(process.env.SCHEDULE_TIME_DELAY_MINUTE || '0'); // minute
const SCHEDULE_TIME_DELAY_SECOND: number = parseInt(process.env.SCHEDULE_TIME_DELAY_SECOND || '0'); // second
const THREAD_AMOUNT: number = parseInt(process.env.THREAD_AMOUNT || '1');
let jobQueueList: Array<BgrQueue.Job> = [];
let isRunning: boolean = false;

/**
 * Initialize job queue list
 */
const initJobQueueList = (): void => {
    jobQueueList = [];
    for (let i: number = 0; i < THREAD_AMOUNT; i++) {
        let jobQueue: BgrQueue.Job = new BgrQueue.Job(i);
        jobQueueList.push(jobQueue);
    }
};

/**
 * @return boolean
 */
export const checkIsRunning = (): boolean => {
    return isRunning;
};

/**
 * Get monitor content
 */
export const getMonitorContent = (): Array<{
    threadIndex: number;
    remainTasks: number;
    status: boolean;
    phase: string | boolean;
}> => {
    return jobQueueList.map((jobQueue, index): any => {
        let returnContent: {
            threadIndex: number;
            remainTasks: number;
            status: boolean;
            phase: string | boolean;
        } = {
            threadIndex: index,
            remainTasks: jobQueue.getRemainElements(),
            status: jobQueue.isRunning,
            phase: false,
        };

        let currentTask: any = jobQueue.getCurrentTask();
        if (jobQueue.isRunning && currentTask) {
            returnContent.phase = currentTask.getPhase();
        }

        return returnContent;
    });
};

/**
 * Get target list
 */
export const getTargetList = (): Array<Array<string>> => {
    return jobQueueList.map(
        (jobQueue): Array<string> => {
            let currentTask: any = jobQueue.getCurrentTask();
            if (jobQueue.isRunning && currentTask) {
                return currentTask.getScrapedPageNumber();
            }
            return [];
        }
    );
};

/**
 * Script of background job.
 */
const script = async function exec(): Promise<void> {
    isRunning = true;
    new ConsoleLog(ConsoleConstant.Type.INFO, `Start background job...`).show();
    initJobQueueList();
    let catalogIdList: Array<number> = (await new Catalog.Logic().getAll()).catalogs.map(catalog => {
        return catalog._id;
    });

    for (const catalogId of catalogIdList) {
        if (!catalogId) {
            continue;
        }
        let scrapeDetailUrlJob: BgrScrape.DetailUrl = new BgrScrape.DetailUrl(catalogId);
        let threadIndex: number = catalogId % THREAD_AMOUNT;
        jobQueueList[threadIndex].pushElement(scrapeDetailUrlJob);
    }

    for (const jobQueue of jobQueueList) {
        if (!jobQueue.isRunning && jobQueue.getRemainElements() > 0) {
            jobQueue.start();
        }
    }
};

/**
 * Start of background job.
 *
 * @param {boolean} force - Run without timer
 */
export const start = async (force: boolean = false): Promise<void> => {
    if (force) {
        await script();
        return;
    }

    let expectTime: Date = new Date();
    expectTime.setUTCHours(SCHEDULE_TIME_HOUR);
    expectTime.setUTCMinutes(SCHEDULE_TIME_MINUTE);
    expectTime.setUTCSeconds(SCHEDULE_TIME_SECOND);
    if (!DateTime.isExactTime(expectTime, true)) {
        return;
    }

    await script();

    const delayTime: number =
        (SCHEDULE_TIME_DELAY_SECOND || 1) *
        (SCHEDULE_TIME_DELAY_MINUTE ? SCHEDULE_TIME_DELAY_MINUTE * 60 : 1) *
        (SCHEDULE_TIME_DELAY_HOUR ? SCHEDULE_TIME_DELAY_HOUR * 3600 : 1);
    setTimeout(script, 1000 * delayTime);
};

/**
 * Main
 */
new Database.MongoDb().connect().then(
    async (): Promise<void> => {
        new ChatBotTelegram();
        try {
            await start();
            initSocketServer();
        } catch (error) {
            ChatBotTelegram.sendMessage(
                `<b>🤖[Background Job]🤖 ❌ ERROR ❌</b>\n→ Message: <code>${error.message}</code>`
            );
            new ConsoleLog(ConsoleConstant.Type.ERROR, `Error: ${error.message}`).show();
        }
        isRunning = false;
    }
);
