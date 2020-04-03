import { Document } from 'mongoose';
import QueueBase from '../queue.base';

export default class QueueSave extends QueueBase {
    private readonly saveAmount: number;
    private SAVE_AMOUNT_DEFAULT: number = parseInt(process.env.SAVE_QUEUE_AMOUNT_DEFAULT || '500');

    constructor(jobName: string, delayTime: number | undefined = undefined, saveAmount: number | undefined) {
        super();
        this.saveAmount = saveAmount || this.SAVE_AMOUNT_DEFAULT;
        this.delayTime = delayTime || this.QUEUE_DELAY_DEFAULT;
        this.logFile.initLogFolder(`save-queue/${jobName}`);
        this.logFile.createFileName('sq_');
        this.start();
    }

    /**
     *
     * @param elements
     */
    public pushElement(elements: Document | Array<Document>): void {
        this.add({ fn: this.saveAction.bind(this), vars: elements });
    }

    /**
     * Start queue
     */
    protected start(): void {
        this.isRunning = true;
        this.loop = setInterval(async (): Promise<void> => {
            let element: { fn: Function; vars: Document | Array<Document> } | undefined = this.queue.shift();
            if (!element) {
                return;
            }

            await element.fn(element.vars);
        }, this.delayTime || this.QUEUE_DELAY_DEFAULT);
    }

    /**
     * Save action
     */
    private async saveAction(elements: Document | Array<Document>): Promise<void> {
        let saveItems: Array<Document> = [];

        if (!Array.isArray(elements)) {
            try {
                this.writeLog(JSON.stringify(await elements.save()));
            } catch (error) {
                this.writeErrorLog(error, JSON.stringify(elements));
            }
            return;
        }

        if (elements.length > this.saveAmount) {
            saveItems = elements.splice(0, this.saveAmount);
            await this.pushElement(saveItems);
        } else {
            saveItems = elements;
        }

        for (const saveItem of saveItems) {
            try {
                this.writeLog(JSON.stringify(await saveItem.save()));
            } catch (error) {
                this.writeErrorLog(error, JSON.stringify(saveItem));
            }
        }
    }
}
