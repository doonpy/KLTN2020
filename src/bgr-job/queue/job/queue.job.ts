import QueueBase from '../queue.base';
import ChatBotTelegram from '../../../services/chatbot/chatBotTelegram';
import StringHandler from '../../../util/string-handler/string-handler';
import { QueueJobConstant } from './queue.job.constant';

export default class QueueJob extends QueueBase {
    protected MAX_TASK_EXECUTE: number = 1;
    private index: number;
    public isRunning: boolean = false;

    constructor(index: number = -1, delayTime: number | undefined = undefined) {
        super();
        this.delayTime = delayTime || this.QUEUE_DELAY_DEFAULT;
        this.index = index;
        this.logFile.initLogFolder('job-queue');
        this.logFile.createFileName(`jq-${this.index}_`);
    }

    /**
     *
     * @param elements
     */
    public pushElement(elements: Function): void {
        this.add(elements);
        this.writeLog(`Add element.`);
    }

    /**
     * Start queue
     */
    public async start(): Promise<void> {
        this.isRunning = true;
        let elementCounter: number = 0;
        while (this.queue.length !== 0) {
            if (elementCounter > this.MAX_TASK_EXECUTE) {
                continue;
            }

            let element: Function | undefined = this.queue.shift();
            if (!element) {
                return;
            }
            elementCounter++;
            try {
                this.writeLog(`Execute element - Queue pending: ${this.queue.length}`);
                await element();
            } catch (error) {
                this.writeErrorLog(error, `Execute element - Queue pending: ${this.queue.length}`);
            }
            elementCounter--;
        }

        this.exportLog();
        this.isRunning = false;
    }

    /**
     * Export log
     */
    public exportLog(): void {
        this.footerLogContent = [
            {
                name: 'Thread index',
                value: this.index,
            },
            {
                name: 'Job amount',
                value: this.countNumber,
            },
            {
                name: 'Job remain:',
                value: this.queue.length,
            },
        ];
        this.logFile.initFooter(this.footerLogContent);
        this.logFile.exportFile();
        this.logFile.initLogFolder('job-queue');
        this.logFile.createFileName('jq_');
        this.logFile.resetLog();
        ChatBotTelegram.sendMessage(
            StringHandler.replaceString(QueueJobConstant.EXPORT_DAILY_LOG, [this.logFile.getUrl()])
        );
        this.countNumber = 1;
    }
}
