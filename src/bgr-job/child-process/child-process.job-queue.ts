import { BgrQueue } from '../queue/queue.index';
import { Database } from '../../services/database/database.index';
import MongoDb = Database.MongoDb;
import ConsoleLog from '../../util/console/console.log';
import { ConsoleConstant } from '../../util/console/console.constant';
import { BgrScrape } from '../scrape/scrape.index';
import ChatBotTelegram from '../../services/chatbot/chatBotTelegram';

/**
 * Initialize job queue
 * @param catalogIdList
 *
 * @return BgrQueue.Job jobQueue
 */
const initJobQueueList = (catalogIdList: Array<number>): BgrQueue.Job => {
    let jobQueue: BgrQueue.Job = new BgrQueue.Job();

    for (const catalogId of catalogIdList) {
        if (!catalogId) {
            continue;
        }
        let scrapeDetailUrlJob: BgrScrape.DetailUrl = new BgrScrape.DetailUrl(catalogId);
        let scrapeRawDataJob: BgrScrape.RawData = new BgrScrape.RawData(catalogId);

        jobQueue.pushElement(scrapeDetailUrlJob);
        jobQueue.pushElement(scrapeRawDataJob);
    }

    return jobQueue;
};

/**
 * Get monitor content
 */
export const getMonitorContent = (
    jobQueue: BgrQueue.Job
): {
    pid: number;
    remainTasks: number;
    status: boolean;
} =>
    Object({
        pid: <any>process.pid,
        remainTasks: jobQueue.getRemainElements(),
        status: true,
    });

/**
 * Get target list
 */
export const getTargets = (jobQueue: BgrQueue.Job): { pid: number; targetList: Array<string> } => {
    if (!jobQueue.checkIsRunning()) {
        return { pid: process.pid, targetList: [] };
    }

    let currentTask: BgrScrape.RawData | BgrScrape.DetailUrl = jobQueue.getCurrentTask();
    if (currentTask) {
        return { pid: process.pid, targetList: currentTask.getTargetList() };
    }

    return { pid: process.pid, targetList: [] };
};

/**
 * Main
 */
process.on(
    'message',
    async ({ catalogIdList }: { catalogIdList: Array<number> }): Promise<void> => {
        const pid: number = process.pid;
        try {
            new ConsoleLog(ConsoleConstant.Type.INFO, `[PID:${pid}] Start crawl process...`).show();

            if (catalogIdList.length === 0) {
                new ConsoleLog(ConsoleConstant.Type.INFO, `[PID:${pid} Crawl complete. Killing process...`).show();
                process.exit(1);
                return;
            }

            await new MongoDb().connect();
            new ChatBotTelegram();
            let jobQueue: BgrQueue.Job = initJobQueueList(catalogIdList);
            jobQueue.start();

            setInterval((): void => {
                if (!jobQueue.checkIsRunning()) {
                    new ConsoleLog(ConsoleConstant.Type.INFO, `[PID:${pid} Crawl complete. Killing process...`).show();
                    process.exit(1);
                    return;
                }

                (<any>process).send({ monitorContent: getMonitorContent(jobQueue), targets: getTargets(jobQueue) });
            }, 1000);
        } catch (error) {
            (<any>process).send({ error });
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `[PID:${pid}] Error: ${error.message}. Killing process...`
            ).show();
            process.exit(1);
        }
    }
);
