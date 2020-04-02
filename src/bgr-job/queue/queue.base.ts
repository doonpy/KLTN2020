import { File } from '../../util/file/file.index';
import StringHandler from '../../util/string-handler/string-handler';
import { QueueSaveConstant } from './save/queue.save.constant';
import ChatBotTelegram from '../../services/chatbot/chatBotTelegram';
import DateTime from '../../util/datetime/datetime';
import _ from 'lodash';

export default abstract class QueueBase {
    protected delayTime: number | undefined;
    protected loop: NodeJS.Timeout | undefined;
    protected logFile: File.Log = new File.Log();
    protected countNumber: number = 0;
    protected queue: Array<any> = [];
    protected isRunning: boolean = false;
    protected startTime: [number, number] | undefined;

    protected readonly QUEUE_DELAY_DEFAULT: number = parseInt(process.env.QUEUE_DELAY_DEFAULT || '100'); // ms

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
    public stop(customizeFooter: Array<{ name: string; value: string | number }> = []): void {
        if (!this.loop) {
            return;
        }
        clearInterval(this.loop);
        let endTime: [number, number] = process.hrtime(this.startTime);
        this.logFile.initFooter(
            _.merge(
                [
                    {
                        name: 'Execution time',
                        value: StringHandler.replaceString(`${DateTime.convertTotalSecondsToTime(endTime[0])}::%i`, [
                            endTime[1] / 1000000,
                        ]),
                    },
                    {
                        name: 'Summary',
                        value: this.countNumber,
                    },
                ],
                customizeFooter
            )
        );
        this.logFile.exportFile();
        this.logFile.resetLog();
        this.isRunning = false;
    }

    /**
     * Write save success log
     *
     * @param content
     */
    protected writeLog(content: string): void {
        this.logFile.addLine(`[${new Date().toLocaleString()}] - ${++this.countNumber} >> ${content}`);
    }

    /**
     * Write save error log
     *
     * @param error
     * @param content
     */
    protected writeErrorLog(error: Error, content: string): void {
        this.logFile.addLine(
            `[${new Date().toLocaleString()}] - ${++this.countNumber} >> ERR: ${error.message} | ${content}`
        );
    }

    /**
     * Get number of remain task
     */
    public getRemainElements(): number {
        return this.queue.length;
    }

    /**
     * Check is running
     */
    public checkIsRunning(): boolean {
        return this.isRunning;
    }
}
