import QueueBase from '../queue.base';
import ChatBotTelegram from '../../../services/chatbot/chatBotTelegram';
import StringHandler from '../../../util/string-handler/string-handler';
import { QueueSaveConstant } from '../save/queue.save.constant';

export default class QueueJob extends QueueBase {
    protected MAX_TASK_EXECUTE: number = 1;
    public isRunning: boolean = false;

    constructor(delayTime: number | undefined = undefined) {
        super();
        this.delayTime = delayTime || this.QUEUE_DELAY_DEFAULT;
        this.logFile.initLogFolder('job-queue');
        this.logFile.createFileName('jq_');
    }

    /**
     *
     * @param elements
     */
    public pushElement(elements: Function): void {
        this.add(elements);
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
                this.writeLog(`Func: ${element.name} - Queue pending: ${this.queue.length}`);
                await element();
            } catch (error) {
                this.writeErrorLog(
                    error,
                    `Func: ${element.name} - Queue pending: ${this.queue.length}`
                );
            }
            elementCounter--;
        }

        this.isRunning = false;
    }

    /**
     * Export log
     */
    public exportLog(): void {
        this.footerLogContent = [
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
            StringHandler.replaceString(QueueSaveConstant.EXPORT_DAILY_LOG, [this.logFile.getUrl()])
        );
        this.countNumber = 1;
    }
}
