import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
import Catalog from '../services/catalog/catalog.index';
import ChatBotTelegram from '../util/chatbot/chatBotTelegram';
import ConsoleLog from '../util/console/console.log';
import ConsoleConstant from '../util/console/console.constant';
import DateTime from '../util/datetime/datetime';
import DatabaseMongodb from '../services/database/mongodb/database.mongodb';
import initEnv from '../util/environment/environment';

import Timeout = NodeJS.Timeout;

const SCRAPE_TYPE_DETAIL_URL = 'detail-url';
const SCRAPE_TYPE_RAW_DATA = 'raw-data';
let childProcessAmount = 0;
let isRunning = false;
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
        childProcessAmount -= 1;
    });
    childProcess.send({ catalogId, scrapeType });
    childProcessAmount += 1;
};

/**
 * Script of background job.
 */
const script = async (): Promise<void> => {
    isRunning = true;
    new ConsoleLog(ConsoleConstant.Type.INFO, `Start background job...`).show();

    const catalogIdList: number[] = (await new Catalog.Logic().getAll()).catalogs.map(catalog => catalog._id);
    const catalogIdListLen: number = catalogIdList.length;
    let count = 0;
    const loop: Timeout = setInterval((): void => {
        if (catalogIdList.length === 0 && childProcessAmount === 0) {
            clearInterval(loop);
            executeCleanDataChildProcess();
            return;
        }

        if (childProcessAmount >= parseInt(process.env.THREAD_AMOUNT || '1', 10)) {
            return;
        }

        const catalogId: number | undefined = catalogIdList.shift();
        if (!catalogId) {
            return;
        }
        if (scrapeType === SCRAPE_TYPE_DETAIL_URL) {
            catalogIdList.push(catalogId);
        }

        executeScrapeChildProcess(catalogId);
        count += 1;

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
const start = async (force = false): Promise<void> => {
    if (isRunning) {
        return;
    }

    if (force) {
        await script();
        return;
    }

    (function clock(): void {
        const checkTimeLoop: Timeout = setInterval(async (): Promise<void> => {
            const expectTime: Date = new Date();
            expectTime.setUTCHours(parseInt(process.env.SCHEDULE_TIME_HOUR || '0', 10));
            expectTime.setUTCMinutes(parseInt(process.env.SCHEDULE_TIME_MINUTE || '0', 10));
            expectTime.setUTCSeconds(parseInt(process.env.SCHEDULE_TIME_SECOND || '0', 10));
            if (!DateTime.isExactTime(expectTime, true)) {
                return;
            }

            clearInterval(checkTimeLoop);
            await script();

            const delayTime: number =
                parseInt(process.env.SCHEDULE_TIME_DELAY_SECOND || '0', 10) *
                (parseInt(process.env.SCHEDULE_TIME_DELAY_MINUTE || '0', 10)
                    ? parseInt(process.env.SCHEDULE_TIME_DELAY_MINUTE || '0', 10) * 60
                    : 1) *
                (parseInt(process.env.SCHEDULE_TIME_DELAY_HOUR || '0', 10)
                    ? parseInt(process.env.SCHEDULE_TIME_DELAY_HOUR || '0', 10) * 3600
                    : 1);
            setTimeout(clock, 1000 * delayTime);
        }, 1000);
    })();
};

/**
 * Main
 */
(async (): Promise<void> => {
    initEnv();
    const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
    const mongoDbInstance: DatabaseMongodb = DatabaseMongodb.getInstance();
    try {
        await mongoDbInstance.connect();
        await start(true);
    } catch (error) {
        await telegramChatBotInstance.sendMessage(
            `<b>🤖[Background Job]🤖 ❌ ERROR ❌</b>\nError: <code>${error.message}</code>`
        );
        new ConsoleLog(ConsoleConstant.Type.ERROR, `Error: ${error.message}`).show();
    }
    isRunning = false;
})();
