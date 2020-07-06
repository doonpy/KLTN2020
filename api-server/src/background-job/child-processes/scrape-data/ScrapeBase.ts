import cherrio from 'cheerio';
import { Browser, Page } from 'puppeteer';
import ChatBotTelegram from '@util/chatbot/ChatBotTelegram';
import { CatalogDocumentModel } from '@service/catalog/interface';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';

const DEFAULT_USER_AGENT =
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

export default abstract class ScrapeBase {
    protected startTime: [number, number] | undefined;
    protected readonly catalog: CatalogDocumentModel;
    protected isRunning = false;
    protected telegramChatBotInstance = ChatBotTelegram.getInstance();
    protected browser!: Browser;

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
            const url = (DOMAIN_PATTERN.test(path)
                ? path
                : domain + (/^\//g.test(path) ? path : `/${path}`)
            ).replace(/\/{3,}/g, '/');

            const page: Page = await this.browser.newPage();
            await page.setUserAgent(DEFAULT_USER_AGENT);
            await page.goto(url, { waitUntil: 'load', timeout: 60000 });
            const content = await page.content();
            await page.close();
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Scrape -> ${page.url()}`
            ).show();
            return cherrio.load(content);
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
