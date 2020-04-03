import { Catalog } from '../services/catalog/catalog.index';
import { Database } from '../services/database/database.index';
import * as dotenv from 'dotenv';
import ChatBotTelegram from '../services/chatbot/chatBotTelegram';
import ConsoleLog from '../util/console/console.log';
import { ConsoleConstant } from '../util/console/console.constant';
import DateTime from '../util/datetime/datetime';
import initSocketServer from './socket.io';
import Timeout = NodeJS.Timeout;
import { ChildProcess, fork } from 'child_process';
import path from 'path';

dotenv.config();

interface MonitorContent {
    pid: number;
    remainTasks: number;
    currentTarget: string;
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
let childProcessList: Array<ChildProcess> = [];
let monitorContentList: Array<MonitorContent> = [];
let targetsList: Array<Targets> = [];
let isRunning: boolean = false;

/**
 * @return boolean
 */
export const checkIsRunning = (): boolean => {
    return isRunning;
};

/**
 * Get monitor content
 */
export const getMonitorContent = (): Array<MonitorContent> => monitorContentList;

/**
 * Get target list
 */
export const getTargetsList = (): Array<Targets> => targetsList;

/**
 * Check is background job complete
 */
const completeCheck = (): void => {
    if (childProcessList.length > 0) {
        return;
    }

    monitorContentList = [];
    targetsList = [];
    isRunning = false;
};

/**
 * Create child process with each job queue
 * @param catalogIdList
 */
const createChildProcess = (catalogIdList: Array<number>): ChildProcess => {
    let childProcess: ChildProcess = fork(path.join(__dirname, './child-process/child-process.job-queue'));

    childProcess.on(
        'message',
        (message: { error?: Error; monitorContent?: MonitorContent; targets: Targets; isComplete?: boolean }): void => {
            if (message.error) {
                childProcessList.splice(childProcess.pid, 1);
                let childProcess2 = createChildProcess(catalogIdList);
                childProcessList[childProcess2.pid] = childProcess2;
                return;
            }

            if (message.targets) {
                targetsList[childProcess.pid] = message.targets;
            }

            if (message.monitorContent) {
                monitorContentList[childProcess.pid] = message.monitorContent;
            }

            if (message.isComplete) {
                childProcessList.splice(childProcess.pid, 1);
                monitorContentList[childProcess.pid].currentTarget = 'N/A';
                completeCheck();
            }
        }
    );

    childProcess.send({ catalogIdList });

    return childProcess;
};

/**
 * Script of background job.
 */
const script = async (): Promise<void> => {
    isRunning = true;
    new ConsoleLog(ConsoleConstant.Type.INFO, `Start background job...`).show();

    let catalogIdList: Array<number> = (await new Catalog.Logic().getAll()).catalogs.map(catalog => catalog._id);
    let catalogIdListDivided: Array<Array<number>> = [];

    for (const catalogId of catalogIdList) {
        if (!catalogId) {
            continue;
        }
        let threadIndex: number = catalogId % THREAD_AMOUNT;

        if (!catalogIdListDivided[threadIndex]) {
            catalogIdListDivided[threadIndex] = [];
        }

        catalogIdListDivided[threadIndex].push(catalogId);
    }

    catalogIdListDivided.forEach((catalogIdList): void => {
        let childProcess: ChildProcess = createChildProcess(catalogIdList);
        childProcessList[childProcess.pid] = childProcess;
    });
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

    setInterval(async (): Promise<void> => {
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
    }, 1000);
};

/**
 * Main
 */
new ChatBotTelegram();
new Database.MongoDb().connect().then(
    async (): Promise<void> => {
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
