import { File } from '../../util/file/file.index';
import StringHandler from '../../util/string-handler/string-handler';
import { QueueSaveConstant } from './save/queue.save.constant';
import ChatBotTelegram from '../../services/chatbot/chatBotTelegram';
import DateTime from '../../util/datetime/datetime';

export default abstract class QueueBase {
    protected delayTime: number | undefined;
    protected loop: NodeJS.Timeout | undefined;
    protected logFile: File.Log = new File.Log();
    protected countNumber: number = 0;
    protected queue: Array<any> = [];
    public isRunning: boolean = false;
    protected startTime: [number, number] | undefined;

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
        this.writeLog(`Add element - Queue remain: ${this.queue.length}`);
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
        this.isRunning = false;
        this.stopAction();
    }

    /**
     * Write save success log
     *
     * @param content
     */
    protected writeLog(content: string): void {
        this.logFile.addLine(
            `[${new Date().toLocaleString()}] - ${++this.countNumber} >> ${content}`
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
            `[${new Date().toLocaleString()}] - ${++this.countNumber} >> ERR: ${
                error.message
            } | ${content}`
        );
    }

    /**
     * Reset log file
     */
    protected stopAction(): void {
        let endTime: [number, number] = process.hrtime(this.startTime);
        this.logFile.initFooter([
            {
                name: 'Execution time',
                value: StringHandler.replaceString(
                    `${DateTime.convertTotalSecondsToTime(endTime[0])}::%i`,
                    [endTime[1] / 1000000]
                ),
            },
            {
                name: 'Summary',
                value: this.countNumber,
            },
        ]);
        this.logFile.exportFile();
        this.logFile.resetLog();
        ChatBotTelegram.sendMessage(
            StringHandler.replaceString(QueueSaveConstant.EXPORT_SUCCESS_LOG, [
                this.logFile.getUrl(),
            ])
        );
    }

    /**
     * Get number of remain task
     */
    public getRemainElements(): number {
        return this.queue.length;
    }
}
