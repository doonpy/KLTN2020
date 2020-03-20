import QueueBase from '../queue.base';
import ChatBotTelegram from '../../../services/chatbot/chatBotTelegram';
import StringHandler from '../../../util/string-handler/string-handler';
import { QueueJobConstant } from './queue.job.constant';

export default class QueueJob extends QueueBase {
    private readonly index: number;
    private currentTask: any | undefined;

    constructor(index: number = -1, delayTime: number | undefined = undefined) {
        super();
        this.delayTime = delayTime || this.QUEUE_DELAY_DEFAULT;
        this.index = index;
        this.logFile.initLogFolder('job-queue');
        this.logFile.createFileName(`jq-${this.index}_`);
    }

    /**
     *
     * @param task
     */
    public pushElement(task: any): void {
        this.add(task);
    }

    /**
     * Start queue
     */
    public start(): void {
        this.isRunning = true;
        this.startTime = process.hrtime();
        this.loop = setInterval(async (): Promise<void> => {
            if (this.currentTask && this.currentTask.isTaskRunning()) {
                return;
            }

            if (this.queue.length === 0) {
                this.stop([{ name: 'Thread ID', value: this.index }]);
                if (this.isRunning) {
                    this.logFile.initLogFolder('job-queue');
                    this.logFile.createFileName(`jq-${this.index}_`);
                }
                ChatBotTelegram.sendMessage(
                    StringHandler.replaceString(QueueJobConstant.EXPORT_SUCCESS_LOG, [
                        this.index,
                        this.logFile.getUrl(),
                    ])
                );
                return;
            }

            this.currentTask = this.queue.shift();
            if (!this.currentTask) {
                return;
            }

            try {
                this.writeLog(`Execute element - Queue pending: ${this.queue.length}`);
                await this.currentTask.start();
            } catch (error) {
                this.writeErrorLog(error, `Execute element - Queue pending: ${this.queue.length}`);
            }
        }, this.QUEUE_DELAY_DEFAULT);
    }

    /**
     * Get current task
     */
    public getCurrentTask(): any | undefined {
        return this.currentTask;
    }
}
