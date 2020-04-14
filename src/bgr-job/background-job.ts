import { Catalog } from '../services/catalog/catalog.index';
import { Database } from '../services/database/database.index';
import * as dotenv from 'dotenv';
import ChatBotTelegram from '../services/chatbot/chatBotTelegram';
import ConsoleLog from '../util/console/console.log';
import { ConsoleConstant } from '../util/console/console.constant';
import DateTime from '../util/datetime/datetime';
import { ChildProcess, fork } from 'child_process';
import path from 'path';
import Timeout = NodeJS.Timeout;

dotenv.config();

interface MonitorContent {
    pid: number;
    scrapeType: string;
    catalogId: number;
    catalogTitle: string;
}

interface Targets {
    pid: number;
    targetList: Array<string>;
}

const SCHEDULE_TIME_HOUR: number = parseInt(process.env.SCHEDULE_TIME_HOUR || '0'); // hour
const SCHEDULE_TIME_MINUTE: number = parseInt(process.env.SCHEDULE_TIME_MINUTE || '0'); // minute
const SCHEDULE_TIME_SECOND: number = parseInt(process.env.SCHEDULE_TIME_SECOND || '0'); // second
const SCHEDULE_TIME_DELAY_HOUR: number = parseInt(process.env.SCHEDULE_TIME_DELAY_HOUR || '0'); // hour
const SCHEDULE_TIME_DELAY_MINUTE: number = parseInt(process.env.SCHEDULE_TIME_DELAY_MINUTE || '0'); // minute
const SCHEDULE_TIME_DELAY_SECOND: number = parseInt(process.env.SCHEDULE_TIME_DELAY_SECOND || '0'); // second
const THREAD_AMOUNT: number = parseInt(process.env.THREAD_AMOUNT || '1');
const SCRAPE_TYPE_DETAIL_URL: string = 'detail-url';
const SCRAPE_TYPE_RAW_DATA: string = 'raw-data';
let childProcessAmount: number = 0;
let monitorContentList: Array<MonitorContent> = [];
let targetsList: Array<Targets> = [];
let isRunning: boolean = false;
let scrapeType: string = SCRAPE_TYPE_DETAIL_URL;

/**
 * Execute group data child process
 */
const executeGroupDataChildProcess = (): void => {
    const childProcess: ChildProcess = fork(path.join(__dirname, './child-process/child-process.group-data'));
    childProcess.on('exit', (): void => {
        isRunning = false;
        new ConsoleLog(ConsoleConstant.Type.INFO, `Background job running complete.`).show();
    });
    childProcess.send({});
};

/**
 * Execute clean data child process
 */
const executeCleanDataChildProcess = (): void => {
    const childProcess: ChildProcess = fork(path.join(__dirname, './child-process/child-process.clean-data'));
    childProcess.on(
        'exit',
        async (): Promise<void> => {
            executeAddCoordinateChildProcess();
        }
    );
    childProcess.send({});
};

/**
 * Execute scrape child process
 * @param catalogId
 */
const executeScrapeChildProcess = (catalogId: number | undefined): void => {
    const childProcess: ChildProcess = fork(path.join(__dirname, './child-process/child-process.scrape-data'));
    childProcess.on('exit', (): void => {
        childProcessAmount--;
    });
    childProcess.send({ catalogId, scrapeType });
    childProcessAmount++;
};

/**
 * Execute add coordinate process
 */
const executeAddCoordinateChildProcess = (): void => {
    const childProcess: ChildProcess = fork(path.join(__dirname, './child-process/child-process.add-coordinate'));
    childProcess.on('exit', (): void => {
        executeGroupDataChildProcess();
    });
    childProcess.send({});
};

/**
 * Script of background job.
 */
const script = async (): Promise<void> => {
    isRunning = true;
    new ConsoleLog(ConsoleConstant.Type.INFO, `Start background job...`).show();

    const catalogIdList: Array<number> = (await new Catalog.Logic().getAll()).catalogs.map(catalog => catalog._id);
    const catalogIdListLen: number = catalogIdList.length;
    let count: number = 0;
    let loop: Timeout = setInterval((): void => {
        if (catalogIdList.length === 0 && childProcessAmount === 0) {
            clearInterval(loop);
            monitorContentList = [];
            targetsList = [];
            executeCleanDataChildProcess();
            return;
        }

        if (childProcessAmount >= THREAD_AMOUNT) {
            return;
        }

        let catalogId: number | undefined = catalogIdList.shift();
        if (!catalogId) {
            return;
        }
        if (scrapeType === SCRAPE_TYPE_DETAIL_URL) {
            catalogIdList.push(catalogId);
        }

        executeScrapeChildProcess(catalogId);
        count++;

        if (count === catalogIdListLen) {
            scrapeType = scrapeType === SCRAPE_TYPE_DETAIL_URL ? SCRAPE_TYPE_RAW_DATA : SCRAPE_TYPE_DETAIL_URL;
            count = 0;
        }
    }, 0);
};

/**
 * Start of background job.
 *
 * @param {boolean} force
 */
export const start = async (force: boolean = false): Promise<void> => {
    if (isRunning) {
        return;
    }

    if (force) {
        await script();
        return;
    }

    (function clock() {
        let checkTimeLoop: Timeout = setInterval(async (): Promise<void> => {
            let expectTime: Date = new Date();
            expectTime.setUTCHours(SCHEDULE_TIME_HOUR);
            expectTime.setUTCMinutes(SCHEDULE_TIME_MINUTE);
            expectTime.setUTCSeconds(SCHEDULE_TIME_SECOND);
            if (!DateTime.isExactTime(expectTime, true)) {
                return;
            }

            clearInterval(checkTimeLoop);
            await script();

            const delayTime: number =
                (SCHEDULE_TIME_DELAY_SECOND || 1) *
                (SCHEDULE_TIME_DELAY_MINUTE ? SCHEDULE_TIME_DELAY_MINUTE * 60 : 1) *
                (SCHEDULE_TIME_DELAY_HOUR ? SCHEDULE_TIME_DELAY_HOUR * 3600 : 1);
            setTimeout(clock, 1000 * delayTime);
        }, 1000);
    })();
};

/**
 * Main
 */
new ChatBotTelegram();
new Database.MongoDb().connect().then(
    async (): Promise<void> => {
        try {
            // await start();
            await script();
        } catch (error) {
            await ChatBotTelegram.sendMessage(
                `<b>🤖[Background Job]🤖 ❌ ERROR ❌</b>\nError: <code>${error.message}</code>`
            );
            new ConsoleLog(ConsoleConstant.Type.ERROR, `Error: ${error.message}`).show();
        }
        isRunning = false;
    }
);
