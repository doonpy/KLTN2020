import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
import ChatBotTelegram from '../util/chatbot/chatBotTelegram';
import ConsoleLog from '../util/console/console.log';
import ConsoleConstant from '../util/console/console.constant';
import CatalogLogic from '../service/catalog/catalog.logic';
import RawDataConstant from '../service/raw-data/raw-data.constant';
import DateTime from '../util/datetime/datetime';
import initEnv from '../util/environment/environment';
import DatabaseMongodb from '../service/database/mongodb/database.mongodb';
import { GroupedDataConstant } from './child-process/child-process.constant';
import ScrapeRawData from './scrape/raw-data/scrape.raw-data';

let isCrawlerRunning = false;
let isGrouperRunning = false;
let script: AsyncGenerator;
const childProcessSet: Set<ChildProcess> = new Set();
const { MESSAGE_TYPE } = GroupedDataConstant;

/**
 * Execute group data child process
 */
export const executeGroupDataChildProcess = async (): Promise<void> => {
    isGrouperRunning = true;
    new ConsoleLog(ConsoleConstant.Type.INFO, `Start group data child process...`).show();
    await ChatBotTelegram.getInstance().sendMessage(`<b>🤖[Background Job]🤖</b>\nStart group data child process...`);

    let propertyTypeIdList: number[] = RawDataConstant.PROPERTY_TYPE.map((item) => item.id);
    const transactionTypeIdList: number[] = RawDataConstant.TRANSACTION_TYPE.map((item) => item.id);
    let childProcessAmount = 0;
    let currentTransactionTypeId: number = transactionTypeIdList.shift() as number;
    let propertyTypeCloneList: number[] = [];
    const loop: NodeJS.Timeout = setInterval(async (): Promise<void> => {
        if (propertyTypeIdList.length === 0) {
            if (transactionTypeIdList.length !== 0) {
                currentTransactionTypeId = transactionTypeIdList.shift() as number;
                propertyTypeIdList = [...propertyTypeCloneList];
                propertyTypeCloneList = [];
            } else if (childProcessAmount === 0) {
                clearInterval(loop);
                isGrouperRunning = false;
                new ConsoleLog(ConsoleConstant.Type.INFO, `Group data complete`).show();
                await ChatBotTelegram.getInstance().sendMessage(`<b>🤖[Background Job]🤖</b>\nGroup data complete`);
            }
            return;
        }

        if (childProcessAmount >= parseInt(process.env.BGR_THREAD_AMOUNT || '1', 10)) {
            return;
        }

        const currentPropertyTypeId: number = propertyTypeIdList.shift() as number;
        propertyTypeCloneList.push(currentPropertyTypeId);

        const childProcess: ChildProcess = fork(path.join(__dirname, './child-process/child-process.group-data'));
        childProcessSet.add(childProcess);
        childProcess.on(
            'exit',
            async (): Promise<void> => {
                childProcessAmount -= 1;
                childProcessSet.delete(childProcess);
            }
        );
        childProcess.send({
            messageType: MESSAGE_TYPE.START,
            transactionTypeId: currentTransactionTypeId,
            propertyTypeId: currentPropertyTypeId,
        });
        childProcessAmount += 1;
    }, 0);
};

/**
 * Execute add coordinate process
 */
const executeAddCoordinateChildProcess = (): void => {
    const childProcess: ChildProcess = fork(path.join(__dirname, './child-process/child-process.add-coordinate'));
    childProcess.on('exit', (): void => {
        script.next();
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
            script.next();
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
            script.next();
            return;
        }

        if (childProcessAmount >= parseInt(process.env.BGR_THREAD_AMOUNT || '1', 10)) {
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
 * Script of background job
 */
async function* generateScript() {
    isCrawlerRunning = true;
    new ConsoleLog(ConsoleConstant.Type.INFO, `Start crawler child process...`).show();
    await ChatBotTelegram.getInstance().sendMessage(`<b>🤖[Background Job]🤖</b>\nStart crawler child process...`);
    if (isGrouperRunning) {
        await ChatBotTelegram.getInstance().sendMessage(`<b>🤖[Background Job]🤖</b>\nSuspense group child process.`);
        childProcessSet.forEach((childProcess): void => {
            new ConsoleLog(ConsoleConstant.Type.INFO, `Suspense group child process - PID: ${childProcess.pid}`).show();
            childProcess.send({ messageType: GroupedDataConstant.MESSAGE_TYPE.SUSPENSE });
        });
    }
    await executeScrapeChildProcess();
    yield 'Step 1: Execute scrape child process...';

    executeCleanDataChildProcess();
    yield 'Step 2: Execute clean data child process...';

    executeAddCoordinateChildProcess();
    yield 'Step 3: Execute add coordinate child process...';

    if (isGrouperRunning) {
        await ChatBotTelegram.getInstance().sendMessage(`<b>🤖[Background Job]🤖</b>\nContinue group child process.`);
        childProcessSet.forEach((childProcess): void => {
            childProcess.on('message', ({ isSuspense }: { isSuspense: boolean }): void => {
                if (isSuspense) {
                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Continue group child process - PID: ${childProcess.pid}`
                    ).show();
                    childProcess.send({ messageType: MESSAGE_TYPE.CONTINUE });
                }
            });
            childProcess.send({ messageType: MESSAGE_TYPE.IS_SUSPENSE });
        });
    }
    new ConsoleLog(ConsoleConstant.Type.INFO, `Crawler complete`).show();
    await ChatBotTelegram.getInstance().sendMessage(`<b>🤖[Background Job]🤖</b>\nCrawler complete`);
    isCrawlerRunning = false;
    return 'Done';
}

/**
 * Execute crawler child process
 */
export const executeCrawlerChildProcess = async (): Promise<void> => {
    script = generateScript();
    script.next();
};

/**
 * Scheduler
 */
(async (): Promise<void> => {
    try {
        initEnv();
        await DatabaseMongodb.getInstance().connect();
        const checkTimeLoop: NodeJS.Timeout = setInterval(async (): Promise<void> => {
            const expectTime: Date = new Date();
            expectTime.setUTCHours(parseInt(process.env.BGR_SCHEDULE_TIME_HOUR || '0', 10));
            expectTime.setUTCMinutes(parseInt(process.env.BGR_SCHEDULE_TIME_MINUTE || '0', 10));
            expectTime.setUTCSeconds(parseInt(process.env.BGR_SCHEDULE_TIME_SECOND || '0', 10));
            if (!DateTime.isExactTime(expectTime, true)) {
                return;
            }

            if (!isGrouperRunning) {
                await executeGroupDataChildProcess();
            }

            if (!isCrawlerRunning) {
                await executeCrawlerChildProcess();
            }
        }, 1000);

        if (Number(process.env.BGR_START_ON_SERVER_RUN) && !isCrawlerRunning) {
            // await executeGroupDataChildProcess();
            // await executeCrawlerChildProcess();
            // await new ScrapeDetailUrl(await CatalogLogic.getInstance().getById(1, true)).start();
            await new ScrapeRawData(await CatalogLogic.getInstance().getById(1, true)).start();
        }
    } catch (error) {
        await ChatBotTelegram.getInstance().sendMessage(`<b>🤖[Background Job]🤖\nError: ${error.message}`);
        throw error;
    }
})();
