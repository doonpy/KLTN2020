import '../prepend';
import { fork } from 'child_process';
import * as path from 'path';
import ChatBotTelegram from '@util/chatbot/ChatBotTelegram';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import CatalogLogic from '@service/catalog/CatalogLogic';
import { isExactTime } from '@util/helper/datetime';

let isCrawlerRunning = false;
let script: AsyncGenerator;

/**
 * Execute preprocessing data process
 */
const executePreprocessingDataChildProcess = (): void => {
    const childProcess = fork(
        path.join(__dirname, './child-processes/preprocessing-data/main')
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
        path.join(__dirname, './child-processes/clean-data/main')
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
            childProcessAmount >= Number(process.env.BGR_THREAD_AMOUNT || '1')
        ) {
            return;
        }

        const catalogId = catalogIdList.shift();
        if (!catalogId) {
            return;
        }

        const childProcess = fork(
            path.join(__dirname, './child-processes/scrape-data/main')
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

    await executeScrapeChildProcess();
    yield 'Step 1: Execute scrape child process...';

    executeCleanDataChildProcess();
    yield 'Step 2: Execute clean data child process...';

    executePreprocessingDataChildProcess();
    yield 'Step 3: Execute preprocessing data child process...';

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
        setInterval(async (): Promise<void> => {
            const expectTime = new Date();
            expectTime.setUTCHours(
                Number(process.env.BGR_SCHEDULE_TIME_HOUR || '0')
            );
            expectTime.setUTCMinutes(
                Number(process.env.BGR_SCHEDULE_TIME_MINUTE || '0')
            );
            expectTime.setUTCSeconds(
                Number(process.env.BGR_SCHEDULE_TIME_SECOND || '0')
            );
            if (!isExactTime(expectTime, true)) {
                return;
            }

            if (!isCrawlerRunning) {
                script = generateScript();
                script.next();
            }
        }, 1000);

        if (Number(process.env.BGR_START_ON_SERVER_RUN) && !isCrawlerRunning) {
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
