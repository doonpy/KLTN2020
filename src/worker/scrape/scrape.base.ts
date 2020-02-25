import sendRequest from '../../util/send-request';
import cherrio from 'cheerio';
import LogFile from '../../util/log-file';
import TelegramChatBot from '../../util/chatbot/telegram.chatbot';
import Timeout = NodeJS.Timeout;

abstract class ScrapeBase {
    protected readonly logInstance: LogFile = new LogFile();
    protected failedRequestCounter: number = 0;
    protected telegramChatBot: TelegramChatBot = new TelegramChatBot();
    protected isScrapeDone: boolean | undefined;
    protected startTime: [number, number] | undefined;
    protected saveQueue: Array<any> = [];

    protected FULL_HOST_URI: string | any = `${process.env.SERVER_PROTOCOL || 'http://'}${process
        .env.SERVER_URI || '127.0.0.1'}${
        process.env.SERVER_PORT ? `:${process.env.SERVER_PORT}` : '3000'
    }`;
    protected readonly MAX_REQUEST: number = parseInt(
        process.env.DETAIL_URL_SCRAPE_MAX_REQUEST || '10'
    );
    protected readonly REQUEST_DELAY: number = parseInt(
        process.env.DETAIL_URL_SCRAPE_MAX_REQUEST || '100'
    );
    protected readonly SAVE_DELAY: number = parseInt(
        process.env.DETAIL_URL_SCRAPE_SAVE_DELAY || '5000'
    );
    protected readonly SAVE_AMOUNT: number = parseInt(
        process.env.DETAIL_URL_SCRAPE_SAVE_AMOUNT || '100'
    );
    protected readonly SAVE_CLEAR_TIMEOUT: number = parseInt(
        process.env.DETAIL_URL_SCRAPE_SAVE_CLEAR_TIMEOUT || '5'
    );

    protected constructor() {}

    /**
     * @param url
     *
     * @return Promise<CheerioStatic>
     */
    protected async getBody(url: string): Promise<CheerioStatic | undefined> {
        try {
            let htmlString = await sendRequest(url);

            return cherrio.load(htmlString);
        } catch (error) {
            this.failedRequestCounter++;
            let errorContent: string = `- ERROR: '${url}' | ${error.message}`;
            this.logInstance.addLine(errorContent);
            return;
        }
    }

    /**
     * @param $
     * @param locator
     * @param attribute
     *
     * @return dataArray
     */
    protected async extractData(
        $: CheerioStatic,
        locator: string,
        attribute: string = ''
    ): Promise<Array<string>> {
        let elementsSelected = $(locator);

        if (elementsSelected.length === 0) {
            return [this.getDataOfElement(elementsSelected, attribute)];
        }

        let dataArray: Array<string> = [];
        elementsSelected.each((index: number, element: CheerioElement): void => {
            dataArray.push(this.getDataOfElement($(element), attribute));
        });

        return dataArray;
    }

    /**
     * @param element
     * @param attribute
     *
     * @return data
     */
    private getDataOfElement(element: Cheerio, attribute: string = ''): string {
        let data: string = '';
        if (attribute) {
            data = element.attr(attribute) || '';
        } else {
            data = element.text();
        }

        return this.handleTextData(data);
    }

    /**
     * Abstract start method
     */
    public abstract async start(): Promise<void>;

    /**
     * Save data from queue to database (have delay time)
     */
    protected saveAction(): void {
        let checkCounter: number = 0;

        const saveLoop: Timeout = setInterval(async (): Promise<void> => {
            let saveItems: Array<any> = [];

            if (this.saveQueue.length > this.SAVE_AMOUNT) {
                saveItems = this.saveQueue.splice(0, this.SAVE_AMOUNT);
            } else {
                saveItems = this.saveQueue.splice(0, this.saveQueue.length);
            }

            saveItems.forEach((saveItem): void => {
                saveItem.save((error: Error): void => {
                    if (error) {
                        throw error;
                    }
                });
            });

            if (this.saveQueue.length === 0) {
                if (checkCounter < this.SAVE_CLEAR_TIMEOUT) {
                    checkCounter++;
                } else {
                    clearInterval(saveLoop);
                }
            } else {
                checkCounter = 0;
            }
        }, this.SAVE_DELAY);
    }

    /**
     * @param rawText
     *
     * @return string
     */
    private handleTextData(rawText: string): string {
        return rawText.replace(/\r+|\n+/, '').trim();
    }

    /**
     * Finish action abstract method.
     *
     * @param successRequestCounter
     */
    protected abstract finishAction(successRequestCounter: number): void;
}

export default ScrapeBase;
