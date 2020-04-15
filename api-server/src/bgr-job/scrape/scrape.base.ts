import cherrio from 'cheerio';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import { Response } from 'request';
import StringHandler from '../../util/string-handler/string-handler';
import CatalogModelInterface from '../../services/catalog/catalog.model.interface';
import Request from '../../util/request/request';
import { ScrapeConstant } from './scrape.constant';
import { File } from '../../util/file/file.index';
import DateTime from '../../util/datetime/datetime';
import ConsoleLog from '../../util/console/console.log';
import { ConsoleConstant } from '../../util/console/console.constant';
import { ResponseStatusCode } from '../../common/common.response-status.code';
import FileLog from '../../util/file/file.log';
import ExceptionCustomize from '../../services/exception/exception.customize';

export default abstract class ScrapeBase {
    protected readonly logInstance: FileLog = new File.Log();
    protected failedRequestCounter: number = 0;
    protected successRequestCounter: number = 0;
    protected countNumber: number = 0;
    protected startTime: [number, number] | undefined;
    protected requestCounter: number = 0;
    protected isRunning: boolean = false;
    protected telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();

    protected readonly REQUEST_DELAY: number = parseInt(process.env.SCRAPE_REQUEST_DELAY || '100', 10);

    protected constructor() {}

    /**
     * @param domain
     * @param path
     *
     * @return Promise<CheerioStatic | undefined>
     */
    protected async getBody(domain: string, path: string): Promise<CheerioStatic | undefined> {
        const url: string = path.includes(domain) ? path : domain + path;
        try {
            const response: Response = await new Request(url).send();
            const statusCode: number = response.statusCode;

            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Scrape: ${response.request.uri.href} - ${statusCode} - ${response.elapsedTime}ms`
            ).show();

            if (response.statusCode !== ResponseStatusCode.OK || response.request.uri.href !== url) {
                this.writeLog(
                    ScrapeConstant.LOG_ACTION.REQUEST,
                    `${statusCode === 200 ? 404 : response.statusCode} (${response.elapsedTime}ms): '${
                        response.request.path
                    }'`
                );
                this.failedRequestCounter++;
                return;
            }

            this.writeLog(
                ScrapeConstant.LOG_ACTION.REQUEST,
                `${statusCode} (${response.elapsedTime}ms): '${response.request.path}'`
            );

            this.successRequestCounter++;
            return cherrio.load(response.body);
        } catch (error) {
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
    protected extractData($: CheerioStatic, locator: string, attribute: string = ''): string[] {
        const elementsSelected = $(locator);

        if (elementsSelected.length === 0) {
            return [this.getDataOfElement(elementsSelected, attribute)];
        }

        const dataArray: string[] = [];
        elementsSelected.each((index: number, element: CheerioElement): void => {
            dataArray.push(this.getDataOfElement($(element), attribute));
        });

        return dataArray;
    }

    /**
     * @param element
     * @param attribute
     *
     * @return string data
     */
    private getDataOfElement(element: Cheerio, attribute: string = ''): string {
        let data: string = '';
        if (attribute) {
            data = element.attr(attribute) || '';
        } else {
            element.contents().each((index: number, item: any): void => {
                if (item.nodeType === ScrapeConstant.NODE_TYPE.TEXT) {
                    data += item.data;
                }
            });
        }

        return StringHandler.cleanText(data, new RegExp(/\r\n|\n|\r/gm));
    }

    /**
     * Abstract start method
     */
    public abstract async start(): Promise<void>;

    /**
     * Finish action abstract method.
     */
    protected abstract finishAction(): void;

    /**
     * @param message
     * @param error
     * @param catalogId
     */
    protected addSummaryErrorLog(message: string, error: Error, catalogId: number | string): void {
        this.logInstance.addLine(`-------- SUMMARY -------`);
        this.logInstance.addLine(`- ERROR: ${error.message}`);
        this.logInstance.addLine(`- CATALOG ID: ${catalogId}`);
        this.logInstance.exportFile();
    }

    /**
     * @param catalog
     * @param customizeFooter
     */
    protected exportLog(
        catalog: CatalogModelInterface,
        customizeFooter: { name: string; value: string | number }[] = []
    ): void {
        const endTime: [number, number] = process.hrtime(this.startTime);
        let footerLogContent: { name: string; value: number | string }[] = [
            {
                name: 'Execution time',
                value: StringHandler.replaceString(`${DateTime.convertTotalSecondsToTime(endTime[0])}::%i`, [
                    endTime[1] / 1000000,
                ]),
            },
            {
                name: 'Catalog ID',
                value: catalog._id,
            },
            {
                name: 'Catalog title',
                value: catalog.title,
            },
            {
                name: 'Success request(s)',
                value: this.successRequestCounter,
            },
            {
                name: 'Failed request(s)',
                value: this.failedRequestCounter,
            },
        ];
        footerLogContent = footerLogContent.concat(customizeFooter);

        this.logInstance.initFooter(footerLogContent);
        this.logInstance.exportFile();
    }

    /**
     * Check is task running
     */
    public isTaskRunning(): boolean {
        return this.isRunning;
    }

    /**
     * Write save success log
     *
     * @param action
     * @param content
     */
    protected writeLog(action: string, content: string): void {
        this.logInstance.addLine(`[${new Date().toLocaleString()}] - ${++this.countNumber} >> ${action}: ${content}`);
    }

    /**
     * Write save error log
     *
     * @param error
     * @param action
     * @param content
     */
    protected writeErrorLog(error: Error | ExceptionCustomize, action: string, content: string): void {
        this.logInstance.addLine(
            `[${new Date().toLocaleString()}] - ${++this.countNumber} >> ERR: ${error.message} | ${action}: ${content}`
        );
    }
}
