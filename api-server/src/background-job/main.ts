import 'module-alias/register';
import '@root/prepend';
import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
import ChatBotTelegram from '@util/chatbot/chatBotTelegram';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import CatalogLogic from '@service/catalog/catalog.logic';
import { isExactTime } from '@util/helper/datetime';
import CommonConstant from '@common/common.constant';
import { GroupedDataConstant } from './child-process/child-process.constant';

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
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Start group data child process...`
    ).show();
    await ChatBotTelegram.getInstance().sendMessage(
        `<b>🤖[Background Job]🤖</b>\nStart group data child process...`
    );

    let propertyTypeIdList = CommonConstant.PROPERTY_TYPE.map(
        (item) => item.id
    );
    const transactionTypeIdList = CommonConstant.TRANSACTION_TYPE.map(
        (item) => item.id
    );
    let childProcessAmount = 0;
    let currentTransactionTypeId = transactionTypeIdList.shift() as number;
    let propertyTypeCloneList: number[] = [];
    const loop = setInterval(async (): Promise<void> => {
        if (propertyTypeIdList.length === 0) {
            if (transactionTypeIdList.length !== 0) {
                currentTransactionTypeId = transactionTypeIdList.shift() as number;
                propertyTypeIdList = [...propertyTypeCloneList];
                propertyTypeCloneList = [];
            } else if (childProcessAmount === 0) {
                clearInterval(loop);
                isGrouperRunning = false;
                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Group data complete`
                ).show();
                await ChatBotTelegram.getInstance().sendMessage(
                    `<b>🤖[Background Job]🤖</b>\nGroup data complete`
                );
            }
            return;
        }

        if (
            childProcessAmount >=
            parseInt(process.env.BGR_THREAD_AMOUNT || '1', 10)
        ) {
            return;
        }

        const currentPropertyTypeId = propertyTypeIdList.shift() as number;
        propertyTypeCloneList.push(currentPropertyTypeId);

        const childProcess = fork(
            path.join(__dirname, './child-process/child-process.group-data')
        );
        childProcessSet.add(childProcess);
        childProcess.on(
            'exit',
            async (): Promise<void> => {
                childProcessAmount--;
                childProcessSet.delete(childProcess);
            }
        );
        childProcess.send({
            messageType: MESSAGE_TYPE.START,
            transactionTypeId: currentTransactionTypeId,
            propertyTypeId: currentPropertyTypeId,
        });
        childProcessAmount++;
    }, 0);
};

/**
 * Execute preprocessing data process
 */
const executePreprocessingDataChildProcess = (): void => {
    const childProcess = fork(
        path.join(__dirname, './child-process/child-process.preprocessing-data')
    );
    childProcess.on('exit', (): void => {
        script.next();
    });
    childProcess.send({});
};

/**
 * Execute clean data child process
 */
const executeCleanDataChildProcess = (): void => {
    const childProcess = fork(
        path.join(__dirname, './child-process/child-process.clean-data')
    );
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
    const catalogIdList: number[] = (
        await CatalogLogic.getInstance().getAll({})
    ).documents.map((catalog) => catalog._id);
    let childProcessAmount = 0;
    const loop = setInterval((): void => {
        if (catalogIdList.length === 0 && childProcessAmount === 0) {
            clearInterval(loop);
            script.next();
            return;
        }

        if (
            childProcessAmount >=
            parseInt(process.env.BGR_THREAD_AMOUNT || '1', 10)
        ) {
            return;
        }

        const catalogId = catalogIdList.shift();
        if (!catalogId) {
            return;
        }

        const childProcess = fork(
            path.join(__dirname, './child-process/child-process.scrape-data')
        );
        childProcess.on('exit', (): void => {
            childProcessAmount--;
        });
        childProcess.send({ catalogId });
        childProcessAmount++;
    }, 0);
};

/**
 * Script of background job
 */
async function* generateScript() {
    isCrawlerRunning = true;
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Start crawler child process...`
    ).show();
    await ChatBotTelegram.getInstance().sendMessage(
        `<b>🤖[Background Job]🤖</b>\nStart crawler child process...`
    );
    if (isGrouperRunning) {
        await ChatBotTelegram.getInstance().sendMessage(
            `<b>🤖[Background Job]🤖</b>\nSuspense group child process.`
        );
        childProcessSet.forEach((childProcess): void => {
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Suspense group child process - PID: ${childProcess.pid}`
            ).show();
            childProcess.send({
                messageType: GroupedDataConstant.MESSAGE_TYPE.SUSPENSE,
            });
        });
    }
    await executeScrapeChildProcess();
    yield 'Step 1: Execute scrape child process...';

    executeCleanDataChildProcess();
    yield 'Step 2: Execute clean data child process...';

    executePreprocessingDataChildProcess();
    yield 'Step 3: Execute preprocessing data child process...';

    if (isGrouperRunning) {
        await ChatBotTelegram.getInstance().sendMessage(
            `<b>🤖[Background Job]🤖</b>\nContinue group child process.`
        );
        childProcessSet.forEach((childProcess): void => {
            childProcess.on(
                'message',
                ({ isSuspense }: { isSuspense: boolean }): void => {
                    if (isSuspense) {
                        new ConsoleLog(
                            ConsoleConstant.Type.INFO,
                            `Continue group child process - PID: ${childProcess.pid}`
                        ).show();
                        childProcess.send({
                            messageType: MESSAGE_TYPE.CONTINUE,
                        });
                    }
                }
            );
            childProcess.send({ messageType: MESSAGE_TYPE.IS_SUSPENSE });
        });
    }
    new ConsoleLog(ConsoleConstant.Type.INFO, `Crawler complete`).show();
    await ChatBotTelegram.getInstance().sendMessage(
        `<b>🤖[Background Job]🤖</b>\nCrawler complete`
    );
    isCrawlerRunning = false;
    return 'Done';
}

/**
 * Scheduler
 */
(async (): Promise<void> => {
    try {
        const checkTimeLoop = setInterval(async (): Promise<void> => {
            const expectTime = new Date();
            expectTime.setUTCHours(
                parseInt(process.env.BGR_SCHEDULE_TIME_HOUR || '0', 10)
            );
            expectTime.setUTCMinutes(
                parseInt(process.env.BGR_SCHEDULE_TIME_MINUTE || '0', 10)
            );
            expectTime.setUTCSeconds(
                parseInt(process.env.BGR_SCHEDULE_TIME_SECOND || '0', 10)
            );
            if (!isExactTime(expectTime, true)) {
                return;
            }

            if (!isGrouperRunning) {
                await executeGroupDataChildProcess();
            }

            if (!isCrawlerRunning) {
                script = generateScript();
                script.next();
            }
        }, 1000);

        if (Number(process.env.BGR_START_ON_SERVER_RUN) && !isCrawlerRunning) {
            await executeGroupDataChildProcess();
            script = generateScript();
            script.next();
        }
    } catch (error) {
        await ChatBotTelegram.getInstance().sendMessage(
            `<b>🤖[Background Job]🤖</b>\nError: ${error.message}`
        );
        throw error;
    }
})();
