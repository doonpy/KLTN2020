import { DetailUrl } from '../../../services/detail-url/detail-url.index';
import { Catalog } from '../../../services/catalog/catalog.index';
import ScrapeBase from '../scrape.base';
import CatalogModelInterface from '../../../services/catalog/catalog.model.interface';
import _ from 'lodash';
import StringHandler from '../../../util/string-handler/string-handler';
import { ScrapeDetailUrlConstantChatBotMessage, ScrapeDetailUrlConstantPhase } from './scrape.detail-url.constant';
import ChatBotTelegram from '../../../services/chatbot/chatBotTelegram';
import { BgrScrape } from '../scrape.index';
import Timeout = NodeJS.Timeout;
import UrlHandler from '../../../util/url-handler/url-handler';
import { ScrapeConstant } from '../scrape.constant';

export default class ScrapeDetailUrl extends ScrapeBase {
    private readonly catalogId: number;
    private detailUrlLogic: DetailUrl.Logic = new DetailUrl.Logic();
    private catalogLogic: Catalog.Logic = new Catalog.Logic();
    private catalog: CatalogModelInterface | any;
    private scrapeRawData: BgrScrape.RawData;
    private pageNumberQueue: Array<string> = [];
    private scrapedPageNumber: Array<string> = [];
    private existedDetailUrls: Array<string> = [];
    private phase: string = '';

    private readonly ATTRIBUTE_TO_GET_DATA: string = 'href';

    constructor(catalogId: number) {
        super();
        this.catalogId = catalogId;
        this.scrapeRawData = new BgrScrape.RawData(catalogId);
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

            ChatBotTelegram.sendMessage(
                StringHandler.replaceString(ScrapeDetailUrlConstantChatBotMessage.START, [
                    this.catalog.title,
                    this.catalog.id,
                ])
            );

            let queryConditions: object = {
                catalogId: this.catalogId,
            };
            this.existedDetailUrls = (await this.detailUrlLogic.getAllWithConditions(queryConditions)).map(
                (existedDetailUrl): string => {
                    return existedDetailUrl.url;
                }
            );
            this.phase = StringHandler.replaceString(ScrapeDetailUrlConstantPhase.DETAIL_URL, [
                this.catalog.title,
                this.catalogId,
            ]);
            this.scrapeAction();
        } catch (error) {
            this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.FETCH_DATA, `Start failed.`);
            this.addSummaryErrorLog(ScrapeDetailUrlConstantChatBotMessage.ERROR, error, this.catalogId);
            this.isRunning = false;
        }
    }

    /**
     * Scrape action.
     */
    private scrapeAction(): void {
        this.pageNumberQueue = [this.catalog.url];

        let loop: Timeout = setInterval(async (): Promise<void> => {
            if (this.pageNumberQueue.length === 0 && this.requestLimiter === 0) {
                clearInterval(loop);
                this.finishAction();
            }

            if (this.requestLimiter > this.MAX_REQUEST) {
                return;
            }

            this.currentUrl = this.pageNumberQueue.shift();
            if (!this.currentUrl) {
                return;
            }

            console.log(this.currentUrl);

            this.requestLimiter++;
            let $: CheerioStatic | undefined = await this.getBody(this.catalog.hostId.domain, this.currentUrl);
            this.scrapedPageNumber.push(this.currentUrl);
            this.scrapedPageNumber = _.uniq(this.scrapedPageNumber);

            if (!$) {
                this.requestLimiter--;
                return;
            }

            await this.handleSuccessRequest($);
            this.requestLimiter--;
        }, this.REQUEST_DELAY);
    }

    /**
     * @param $
     */
    private async handleSuccessRequest($: CheerioStatic): Promise<void> {
        let newDetailUrlList: Array<string> = this.extractData(
            $,
            this.catalog.locator.detailUrl,
            this.ATTRIBUTE_TO_GET_DATA
        );

        newDetailUrlList = this.urlSanitizeAndFilter(newDetailUrlList, this.existedDetailUrls);
        this.existedDetailUrls = _.uniq(_.concat(this.existedDetailUrls, newDetailUrlList));

        for (const detailUrl of newDetailUrlList) {
            let detailUrlDoc: DetailUrl.DocumentInterface = this.detailUrlLogic.createDocument(
                this.catalogId,
                detailUrl
            );
            try {
                let createdDoc: DetailUrl.DocumentInterface = await this.detailUrlLogic.create(detailUrlDoc);
                this.writeLog(ScrapeConstant.LOG_ACTION.CREATE, `ID: ${createdDoc ? createdDoc._id : 'N/A'}`);
            } catch (error) {
                this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.CREATE, `ID: ${detailUrlDoc._id}`);
            }
        }

        let newPageNumberUrls: Array<string> = this.extractData(
            $,
            this.catalog.locator.pageNumber,
            this.ATTRIBUTE_TO_GET_DATA
        );

        newPageNumberUrls = this.urlSanitizeAndFilter(newPageNumberUrls, this.scrapedPageNumber);

        this.pageNumberQueue = _.uniq(_.concat(this.pageNumberQueue, newPageNumberUrls));
    }

    /**
     * Finish scrape action.
     */
    protected async finishAction(): Promise<void> {
        this.exportLog(this.catalog);
        ChatBotTelegram.sendMessage(
            StringHandler.replaceString(ScrapeDetailUrlConstantChatBotMessage.FINISH, [
                this.catalog.title,
                this.catalog.id,
                this.logInstance.getUrl(),
            ])
        );

        await this.scrapeRawData.start();
        this.phase = StringHandler.replaceString(ScrapeDetailUrlConstantPhase.RAW_DATA, [
            this.catalog.title,
            this.catalogId,
        ]);
        let checkLoop: Timeout = setInterval((): void => {
            if (this.scrapeRawData.isTaskRunning()) {
                return;
            }
            clearInterval(checkLoop);
            this.isRunning = false;
        }, 0);
    }

    /**
     * @param sourceUrls
     * @param filterArray
     *
     * @return Array<string>
     */
    private urlSanitizeAndFilter(sourceUrls: Array<string>, filterArray: Array<string>): Array<string> {
        sourceUrls = _.uniq(
            sourceUrls.map((url): string => {
                return UrlHandler.sanitizeUrl(url);
            })
        );

        return sourceUrls.filter((url: string): boolean => url !== '' && filterArray.indexOf(url) < 0);
    }

    /**
     * Get phase
     */
    public getPhase(): string {
        return this.phase;
    }

    /**
     * Get page number scraped
     */
    public getScrapedPageNumber(): Array<string> {
        if (!this.scrapeRawData.isTaskRunning()) {
            return this.scrapedPageNumber;
        }

        return this.scrapeRawData.getExtractedDetailUrl();
    }
}
