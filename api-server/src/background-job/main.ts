import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
import ChatBotTelegram from '../util/chatbot/chatBotTelegram';
import ConsoleLog from '../util/console/console.log';
import ConsoleConstant from '../util/console/console.constant';
import CatalogLogic from '../service/catalog/catalog.logic';
import RawDataConstant from '../service/raw-data/raw-data.constant';

let isRunning = false;

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
                new ConsoleLog(ConsoleConstant.Type.INFO, `Background job running complete.`).show();
                await ChatBotTelegram.getInstance().sendMessage(`<b>🤖[Background Job]🤖\nStart background job...`);
                isRunning = false;
            } else {
                currentTransactionTypeId = transactionTypeIdList.shift() as number;
            }
            return;
        }

        if (childProcessAmount >= parseInt(process.env.BGR_THREAD_AMOUNT || '1', 10)) {
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
 * Start
 */
const main = async (): Promise<void> => {
    isRunning = true;
    new ConsoleLog(ConsoleConstant.Type.INFO, `Start background job...`).show();
    await ChatBotTelegram.getInstance().sendMessage(`<b>🤖[Background Job]🤖</b>\nStart background job...`);
    await executeScrapeChildProcess();
};

const isBgrJobRunning = (): boolean => isRunning;

export default {
    main,
    isBgrJobRunning,
};
