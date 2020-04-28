import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
import ChatBotTelegram from '../util/chatbot/chatBotTelegram';
import ConsoleLog from '../util/console/console.log';
import ConsoleConstant from '../util/console/console.constant';
import DateTime from '../util/datetime/datetime';
import DatabaseMongodb from '../service/database/mongodb/database.mongodb';
import initEnv from '../util/environment/environment';
import CatalogLogic from '../service/catalog/catalog.logic';
import RawDataConstant from '../service/raw-data/raw-data.constant';

let isRunning = false;
let telegramChatBotInstance: ChatBotTelegram | undefined;

/**
 * Execute group data child process
 */
const executeGroupDataChildProcess = (): void => {
    const propertyTypeIdList: number[] = RawDataConstant.PROPERTY_TYPE.map((item) => item.id);
    const transactionTypeIdList: number[] = RawDataConstant.TRANSACTION_TYPE.map((item) => item.id);
    let childProcessAmount = 0;
    let currentTransactionTypeId: number = transactionTypeIdList.shift() as number;
    const loop: NodeJS.Timeout = setInterval(async (): Promise<void> => {
        if (propertyTypeIdList.length === 0 && childProcessAmount === 0) {
            if (transactionTypeIdList.length === 0) {
                clearInterval(loop);
                isRunning = false;
                new ConsoleLog(ConsoleConstant.Type.INFO, `Background job running complete.`).show();
                await telegramChatBotInstance?.sendMessage(`<b>🤖[Background Job]🤖\nStart background job...`);
            } else {
                currentTransactionTypeId = transactionTypeIdList.shift() as number;
            }
            return;
        }

        if (childProcessAmount >= parseInt(process.env.THREAD_AMOUNT || '1', 10)) {
            return;
        }

        const currentPropertyTypeId: number = propertyTypeIdList.shift() as number;

        const childProcess: ChildProcess = fork(path.join(__dirname, './child-process/child-process.group-data'));
        childProcess.on(
            'exit',
            async (): Promise<void> => {
                childProcessAmount -= 1;
            }
        );
        childProcess.send({ transactionTypeId: currentTransactionTypeId, propertyTypeId: currentPropertyTypeId });
        childProcessAmount += 1;
    }, 0);
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
 */
const executeScrapeChildProcess = async (): Promise<void> => {
    const catalogIdList: number[] = (await CatalogLogic.getInstance().getAll()).documents.map((catalog) => catalog._id);
    let childProcessAmount = 0;
    const loop: NodeJS.Timeout = setInterval((): void => {
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

        const childProcess: ChildProcess = fork(path.join(__dirname, './child-process/child-process.scrape-data'));
        childProcess.on('exit', (): void => {
            childProcessAmount -= 1;
        });
        childProcess.send({ catalogId });
        childProcessAmount += 1;
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

    isRunning = true;
    new ConsoleLog(ConsoleConstant.Type.INFO, `Start background job...`).show();
    await telegramChatBotInstance?.sendMessage(`<b>🤖[Background Job]🤖</b>\nStart background job...`);

    if (force) {
        await executeScrapeChildProcess();
        return;
    }

    (function clock(): void {
        const checkTimeLoop: NodeJS.Timeout = setInterval(async (): Promise<void> => {
            const expectTime: Date = new Date();
            expectTime.setUTCHours(parseInt(process.env.SCHEDULE_TIME_HOUR || '0', 10));
            expectTime.setUTCMinutes(parseInt(process.env.SCHEDULE_TIME_MINUTE || '0', 10));
            expectTime.setUTCSeconds(parseInt(process.env.SCHEDULE_TIME_SECOND || '0', 10));
            if (!DateTime.isExactTime(expectTime, true)) {
                return;
            }

            clearInterval(checkTimeLoop);
            await executeScrapeChildProcess();

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
    telegramChatBotInstance = ChatBotTelegram.getInstance();
    try {
        await DatabaseMongodb.getInstance().connect();
        await start(true);
    } catch (error) {
        await telegramChatBotInstance.sendMessage(
            `<b>🤖[Background Job]🤖 ❌ ERROR ❌</b>\nError: <code>${error.message}</code>`
        );
        new ConsoleLog(ConsoleConstant.Type.ERROR, `Error: ${error.message}`).show();
    }
    isRunning = false;
})();
