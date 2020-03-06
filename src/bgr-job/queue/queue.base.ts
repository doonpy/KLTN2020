import { File } from '../../util/file/file.index';
import StringHandler from '../../util/string-handler/string-handler';
import { QueueSaveConstant } from './save/queue.save.constant';
import ChatBotTelegram from '../../services/chatbot/chatBotTelegram';

export default abstract class QueueBase {
    protected delayTime: number | undefined;
    protected loop: NodeJS.Timeout | undefined;
    protected logFile: File.Log = new File.Log();
    protected countNumber: number = 1;
    protected queue: Array<any> = [];
    protected footerLogContent: Array<{ name: string; value: any }> = [];

    protected readonly QUEUE_DELAY_DEFAULT: number = parseInt(
        process.env.QUEUE_DELAY_DEFAULT || '100'
    ); // ms

    protected constructor() {}

    /**
     * Add task to queue
     *
     * @param task
     */
    protected add(task: any): void {
        this.queue.push(task);
    }

    /**
     * @return Array<any> queue
     */
    public getQueue(): Array<any> {
        return this.queue;
    }

    /**
     * Execute task
     */
    protected abstract start(): void;

    /**
     * Stop loop
     */
    public stop(): void {
        if (!this.loop) {
            return;
        }
        clearInterval(this.loop);
        this.stopAction();
    }

    /**
     * Write save success log
     *
     * @param content
     */
    protected writeLog(content: string): void {
        this.logFile.addLine(
            `[${new Date().toLocaleString()}] - ${this.countNumber++} >> ${content}`
        );
    }

    /**
     * Write save error log
     *
     * @param error
     * @param content
     */
    protected writeErrorLog(error: Error, content: string): void {
        this.logFile.addLine(
            `[${new Date().toLocaleString()}] - ${this.countNumber++} >> ERR: ${
                error.message
            } | ${content}`
        );
    }

    /**
     * Reset log file
     */
    protected stopAction(): void {
        this.logFile.initFooter(this.footerLogContent);
        this.logFile.exportFile();
        ChatBotTelegram.sendMessage(
            StringHandler.replaceString(QueueSaveConstant.EXPORT_DAILY_LOG, [this.logFile.getUrl()])
        );
    }

    /**
     * Get number of remain task
     */
    public getRemainTask(): number {
        return this.queue.length;
    }
}
