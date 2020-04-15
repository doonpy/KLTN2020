import { DetailUrl } from '../../../services/detail-url/detail-url.index';
import { Catalog } from '../../../services/catalog/catalog.index';
import ScrapeBase from '../scrape.base';
import CatalogModelInterface from '../../../services/catalog/catalog.model.interface';
import StringHandler from '../../../util/string-handler/string-handler';
import { ScrapeDetailUrlConstantChatBotMessage } from './scrape.detail-url.constant';
import UrlHandler from '../../../util/url-handler/url-handler';
import { ScrapeConstant } from '../scrape.constant';
import ConsoleLog from '../../../util/console/console.log';
import { ConsoleConstant } from '../../../util/console/console.constant';
import DetailUrlLogic from '../../../services/detail-url/detail-url.logic';
import CatalogLogic from '../../../services/catalog/catalog.logic';
import DetailUrlModelInterface from '../../../services/detail-url/detail-url.model.interface';
import Timeout = NodeJS.Timeout;

export default class ScrapeDetailUrl extends ScrapeBase {
    private readonly catalogId: number;
    private detailUrlLogic: DetailUrlLogic = new DetailUrl.Logic();
    private catalogLogic: CatalogLogic = new Catalog.Logic();
    private catalog: CatalogModelInterface | any;
    private pageNumberQueue: string[] = [];
    private scrapedPageNumber: string[] = [];
    private readonly MAX_REQUEST: number = parseInt(process.env.SCRAPE_DETAIL_URL_MAX_REQUEST || '1', 10);

    private readonly ATTRIBUTE_TO_GET_DATA: string = 'href';

    constructor(catalogId: number) {
        super();
        this.catalogId = catalogId;
        this.logInstance.initLogFolder('detail-url-scrape');
        this.logInstance.createFileName('cid-' + catalogId + '_');
    }

    /**
     * Start detail URL scraper
     */
    public async start(): Promise<void> {
        try {
            this.startTime = process.hrtime();
            this.isRunning = true;

            await Catalog.Logic.checkCatalogExistedWithId(this.catalogId);
            this.catalog = await this.catalogLogic.getById(this.catalogId);

            await this.telegramChatBotInstance.sendMessage(
                StringHandler.replaceString(ScrapeDetailUrlConstantChatBotMessage.START, [
                    this.catalog.title,
                    this.catalog.id,
                ])
            );

            this.scrapeAction();
        } catch (error) {
            this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.FETCH_DATA, `Start failed.`);
            this.addSummaryErrorLog(ScrapeDetailUrlConstantChatBotMessage.ERROR, error, this.catalogId);
            await this.telegramChatBotInstance.sendMessage(
                StringHandler.replaceString(error.message, [this.catalogId, error.message, this.logInstance.getUrl()])
            );
            this.isRunning = false;
            throw new Error(
                `Scrape detail URL of catalog ${this.catalog.title} (ID:${this.catalogId}) failed.\nError: ${error.message}`
            );
        }
    }

    /**
     * Scrape action.
     */
    private scrapeAction(): void {
        this.pageNumberQueue = [this.catalog.url];

        const loop: Timeout = setInterval(async (): Promise<void> => {
            if (this.pageNumberQueue.length === 0 && this.requestCounter === 0) {
                clearInterval(loop);
                this.finishAction();
            }

            if (this.requestCounter > this.MAX_REQUEST) {
                return;
            }

            const currentUrl: string | undefined = this.pageNumberQueue.shift();
            if (!currentUrl) {
                return;
            }

            this.requestCounter++;
            const $: CheerioStatic | undefined = await this.getBody(this.catalog.hostId.domain, currentUrl);
            this.scrapedPageNumber.push(currentUrl);

            if (!$) {
                this.requestCounter--;
                return;
            }

            await this.handleSuccessRequest($);
            this.requestCounter--;
        }, this.REQUEST_DELAY);
    }

    /**
     * @param $
     */
    private async handleSuccessRequest($: CheerioStatic): Promise<void> {
        let newDetailUrlList: string[] = this.extractData(
            $,
            this.catalog.locator.detailUrl,
            this.ATTRIBUTE_TO_GET_DATA
        );

        newDetailUrlList = newDetailUrlList.map((url): string => UrlHandler.sanitizeUrl(url));
        for (const newDetailUrl of newDetailUrlList) {
            const result: number = (await this.detailUrlLogic.getAll({ url: newDetailUrl }, false)).detailUrls.length;
            if (!result) {
                try {
                    const detailUrlDoc: DetailUrlModelInterface = DetailUrl.Logic.createDocument(
                        this.catalogId,
                        newDetailUrl
                    );
                    const createdDoc: DetailUrlModelInterface = await this.detailUrlLogic.create(detailUrlDoc);
                    this.writeLog(ScrapeConstant.LOG_ACTION.CREATE, `ID: ${createdDoc ? createdDoc._id : 'N/A'}`);
                } catch (error) {
                    this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.CREATE, `URL: ${newDetailUrl}`);
                }
            }
        }

        let newPageNumberUrls: string[] = this.extractData(
            $,
            this.catalog.locator.pageNumber,
            this.ATTRIBUTE_TO_GET_DATA
        );

        newPageNumberUrls = newPageNumberUrls.map((url): string => UrlHandler.sanitizeUrl(url));
        for (const newPageNumberUrl of newPageNumberUrls) {
            if (
                this.pageNumberQueue.indexOf(newPageNumberUrl) < 0 &&
                this.scrapedPageNumber.indexOf(newPageNumberUrl) < 0
            ) {
                this.pageNumberQueue.push(newPageNumberUrl);
            }
        }
    }

    /**
     * Finish scrape action.
     */
    protected async finishAction(): Promise<void> {
        this.exportLog(this.catalog);
        await this.telegramChatBotInstance.sendMessage(
            StringHandler.replaceString(ScrapeDetailUrlConstantChatBotMessage.FINISH, [
                this.catalog.title,
                this.catalog.id,
                this.logInstance.getUrl(),
            ])
        );
        this.isRunning = false;
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Scrape detail URL of catalog ${this.catalog.title} (ID:${this.catalogId}) complete.`
        ).show();
        process.exit(0);
    }

    /**
     * Get page number scraped
     */
    public getTargetList(): string[] {
        return this.scrapedPageNumber;
    }

    /**
     * Get catalog target
     */
    public getCatalog(): CatalogModelInterface {
        return this.catalog;
    }
}
