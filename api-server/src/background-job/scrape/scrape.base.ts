import cherrio from 'cheerio';
import { Response } from 'request';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import StringHandler from '../../util/string-handler/string-handler';
import { CatalogDocumentModel } from '../../service/catalog/catalog.interface';
import Request from '../../util/request/request';
import ScrapeConstant from './scrape.constant';
import File from '../../util/file/file.index';
import DateTime from '../../util/datetime/datetime';
import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import ResponseStatusCode from '../../common/common.response-status.code';
import FileLog from '../../util/file/file.log';
import ExceptionCustomize from '../../util/exception/exception.customize';

export default class ScrapeBase {
    protected readonly logInstance: FileLog = new File.Log();

    protected failedRequestCounter = 0;

    protected successRequestCounter = 0;

    protected countNumber = 0;

    protected startTime: [number, number] | undefined;

    protected requestCounter = 0;

    protected isRunning = false;

    protected telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();

    protected readonly REQUEST_DELAY: number = parseInt(process.env.SCRAPE_REQUEST_DELAY || '100', 10);

    /**
     * @param domain
     * @param path
     *
     * @return Promise<CheerioStatic | undefined>
     */
    protected async getStaticBody(domain: string, path: string): Promise<CheerioStatic | undefined> {
        const url: string = path.includes(domain) ? path : domain + (/(^\/)?/.test(path) ? path : `/${path}`);
        const response: Response = await new Request(url).send();
        const { statusCode } = response;

        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Send request -> ${response.request.uri.href} - ${statusCode} - ${response.elapsedTime}ms`
        ).show();

        if (response.statusCode !== ResponseStatusCode.OK || response.request.uri.href !== url) {
            this.writeLog(
                ScrapeConstant.LOG_ACTION.REQUEST,
                `${statusCode === 200 ? 404 : response.statusCode} (${response.elapsedTime}ms): '${
                    response.request.path
                }'`
            );
            this.failedRequestCounter += 1;
            return undefined;
        }

        this.writeLog(
            ScrapeConstant.LOG_ACTION.REQUEST,
            `${statusCode} (${response.elapsedTime}ms): '${response.request.path}'`
        );

        this.successRequestCounter += 1;
        return cherrio.load(response.body);
    }

    /**
     * @param $
     * @param locator
     * @param attribute
     *
     * @return dataArray
     */
    protected static extractData($: CheerioStatic, locator: string, attribute = ''): string[] {
        const elementsSelected = $(locator);

        if (elementsSelected.length === 0) {
            return [''];
        }

        const data: string[] = [];
        elementsSelected.each((index: number, element: CheerioElement): void => {
            data.push(ScrapeBase.getDataOfElement($(element), attribute));
        });

        return data;
    }

    /**
     * @param element
     * @param attribute
     *
     * @return string data
     */
    private static getDataOfElement(element: Cheerio, attribute = ''): string {
        let data = '';
        if (attribute) {
            data = element.attr(attribute) || '';
        } else {
            element.contents().each((index, item): void => {
                if (item.type === ScrapeConstant.NODE_TYPE.TEXT) {
                    data += item.data;
                }
            });
        }

        return data
            .replace(/\r|\n|\r\n/gm, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

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
        catalog: CatalogDocumentModel,
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
        this.countNumber += 1;
        this.logInstance.addLine(`[${new Date().toLocaleString()}] - ${this.countNumber} >> ${action}: ${content}`);
    }

    /**
     * Write save error log
     *
     * @param error
     * @param action
     * @param content
     */
    protected writeErrorLog(error: Error | ExceptionCustomize, action: string, content: string): void {
        this.countNumber += 1;
        this.logInstance.addLine(
            `[${new Date().toLocaleString()}] - ${this.countNumber} >> ERR: ${error.message} | ${action}: ${content}`
        );
    }
}
