import cherrio from 'cheerio';
import { Response } from 'request';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import Request from '../../util/request/request';
import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import ResponseStatusCode from '../../common/common.response-status.code';

export default class ScrapeBase {
    protected startTime: [number, number] | undefined;

    protected requestCounter = 0;

    protected isRunning = false;

    protected telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();

    protected readonly REQUEST_DELAY: number = parseInt(process.env.BGR_SCRAPE_REQUEST_DELAY || '100', 10);

    /**
     * @param domain
     * @param path
     *
     * @return Promise<CheerioStatic | undefined>
     */
    protected async getStaticBody(domain: string, path: string): Promise<CheerioStatic | undefined> {
        const DOMAIN_PATTERN = new RegExp(/^(https?:\/\/)(?:www\.)?([\d\w-]+)(\.([\d\w-]+))+/);
        domain = domain.replace(/\/{2,}$/, '');
        const url: string = DOMAIN_PATTERN.test(path) ? path : domain + (/^\//.test(path) ? path : `/${path}`);

        try {
            const response: Response = await new Request(url).send();
            const { statusCode } = response;

            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Send request -> ${response.request.uri.href} - ${statusCode} - ${response.elapsedTime}ms`
            ).show();

            if (response.statusCode !== ResponseStatusCode.OK || response.request.uri.href !== url) {
                return undefined;
            }

            return cherrio.load(response.body);
        } catch (error) {
            new ConsoleLog(ConsoleConstant.Type.ERROR, `Send request -> ${url} - Error: ${error.message}`).show();
            return undefined;
        }
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
            data += `${element.text()}`;
        }

        return data;
    }

    /**
     * Check is task running
     */
    public isTaskRunning(): boolean {
        return this.isRunning;
    }
}
