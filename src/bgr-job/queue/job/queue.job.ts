import QueueBase from '../queue.base';
import ChatBotTelegram from '../../../services/chatbot/chatBotTelegram';
import StringHandler from '../../../util/string-handler/string-handler';
import { QueueJobConstant } from './queue.job.constant';

export default class QueueJob extends QueueBase {
    private readonly index: number;

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
    public pushElement(elements: any): void {
        this.add(elements);
    }

    /**
     * Start queue
     */
    public start(): void {
        this.isRunning = true;
        let currentElement: any | undefined = undefined;
        this.startTime = process.hrtime();
        this.loop = setInterval(async (): Promise<void> => {
            if (currentElement && currentElement.isTaskRunning()) {
                return;
            }

            if (this.queue.length === 0) {
                this.stop([{ name: 'Thread ID', value: this.index }]);
                this.logFile.initLogFolder('job-queue');
                this.logFile.createFileName('jq_');
                ChatBotTelegram.sendMessage(
                    StringHandler.replaceString(QueueJobConstant.EXPORT_SUCCESS_LOG, [
                        this.index,
                        this.logFile.getUrl(),
                    ])
                );
                return;
            }

            currentElement = this.queue.shift();
            if (!currentElement) {
                return;
            }

            try {
                this.writeLog(`Execute element - Queue pending: ${this.queue.length}`);
                await currentElement.start();
            } catch (error) {
                this.writeErrorLog(error, `Execute element - Queue pending: ${this.queue.length}`);
            }
        }, this.QUEUE_DELAY_DEFAULT);
    }
}
