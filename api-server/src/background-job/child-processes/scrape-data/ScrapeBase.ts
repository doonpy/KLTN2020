import cherrio from 'cheerio';
import ChatBotTelegram from '@util/chatbot/ChatBotTelegram';
import { sendRequest } from '@util/request';
import ResponseStatusCode from '@common/response-status-code';
import { CatalogDocumentModel } from '@service/catalog/interface';
import { AxiosRequestConfig } from 'axios';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';

const DEFAULT_REQUEST_OPTIONS: AxiosRequestConfig = {
    headers: {
        'User-Agent':
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        Accept: 'text/plain,text/html,*/*',
    },
    timeout: Number(process.env.BGR_REQUEST_TIMEOUT || '10000'),
};

export default abstract class ScrapeBase {
    protected startTime: [number, number] | undefined;
    protected readonly catalog: CatalogDocumentModel;
    protected isRunning = false;
    protected telegramChatBotInstance = ChatBotTelegram.getInstance();

    protected constructor(catalog: CatalogDocumentModel) {
        this.catalog = catalog;
    }

    protected async getStaticBody(
        domain: string,
        path: string
    ): Promise<CheerioStatic | null> {
        try {
            const DOMAIN_PATTERN = RegExp(
                /^(https?:\/\/)(?:www\.)?([\d\w-]+)(\.([\d\w-]+))+/
            );
            const originDomain = domain.replace(/\/{2,}$/, '');
            const url = DOMAIN_PATTERN.test(path)
                ? path
                : originDomain + (/^\//.test(path) ? path : `/${path}`);

            const { data, status, request } = await sendRequest<string>({
                ...DEFAULT_REQUEST_OPTIONS,
                url,
            });

            if (
                status !== ResponseStatusCode.OK ||
                !url.includes(request.path)
            ) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Scrape -> ${domain}${request.path} - ${status}`
                ).show();
                return null;
            }

            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Scrape -> ${domain}${request.path} - ${status}`
            ).show();
            return cherrio.load(data);
        } catch (error) {
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Scrape - Error: ${error.message}`
            ).show();
            return null;
        }
    }

    protected static extractData(
        $: CheerioStatic,
        locator: string,
        attribute = ''
    ): string[] {
        const elementsSelected = $(locator);

        if (elementsSelected.length === 0) {
            return [''];
        }

        const data: string[] = [];
        elementsSelected.each(
            (index: number, element: CheerioElement): void => {
                data.push(ScrapeBase.getDataOfElement($(element), attribute));
            }
        );

        return data;
    }

    private static getDataOfElement(element: Cheerio, attribute = ''): string {
        let data = '';
        if (attribute) {
            data = element.attr(attribute) || '';
        } else {
            data += element.text();
        }

        return data;
    }
}
