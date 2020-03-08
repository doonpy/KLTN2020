import { DetailUrl } from '../../../services/detail-url/detail-url.index';
import { Catalog } from '../../../services/catalog/catalog.index';
import ScrapeBase from '../scrape.base';
import CatalogModelInterface from '../../../services/catalog/catalog.model.interface';
import _ from 'lodash';
import StringHandler from '../../../util/string-handler/string-handler';
import { ScrapeDetailUrlConstantChatBotMessage } from './scrape.detail-url.constant';
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
    private existedDetailUrls: Array<string> = [];

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

            ChatBotTelegram.sendMessage(
                StringHandler.replaceString(ScrapeDetailUrlConstantChatBotMessage.START, [
                    this.catalog.title,
                    this.catalog.id,
                ])
            );

            let queryConditions: object = {
                catalogId: this.catalogId,
            };
            this.existedDetailUrls = (
                await this.detailUrlLogic.getAllWithConditions(queryConditions)
            ).map((existedDetailUrl): string => {
                return existedDetailUrl.url;
            });

            this.scrapeAction();
        } catch (error) {
            this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.FETCH_DATA, `Start failed.`);
            this.addSummaryErrorLog(
                ScrapeDetailUrlConstantChatBotMessage.ERROR,
                error,
                this.catalogId
            );
        }
    }

    /**
     * Scrape action.
     */
    private scrapeAction(): void {
        let pageNumberQueue: Array<string> = [this.catalog.url];
        let pageNumberScraped: Array<string> = [];

        let loop: Timeout = setInterval(async (): Promise<void> => {
            if (pageNumberQueue.length === 0 && this.requestLimiter === 0) {
                clearInterval(loop);
                this.finishAction();
            }

            if (this.requestLimiter > this.MAX_REQUEST) {
                return;
            }

            let currentUrl: string | undefined = pageNumberQueue.shift() || undefined;
            if (!currentUrl) {
                return;
            }
            this.requestLimiter++;

            let $: CheerioStatic | undefined = await this.getBody(
                this.catalog.hostId.domain,
                currentUrl
            );
            pageNumberScraped.push(currentUrl);

            if (!$) {
                this.requestLimiter--;
                return;
            }

            pageNumberQueue = _.uniq(
                pageNumberQueue.concat(await this.handleSuccessRequest($, pageNumberScraped))
            );

            this.requestLimiter--;
        }, this.REQUEST_DELAY);
    }

    /**
     * @param $
     * @param pageNumberScraped
     */
    private async handleSuccessRequest(
        $: CheerioStatic,
        pageNumberScraped: Array<string>
    ): Promise<Array<string>> {
        let newDetailUrlList: Array<string> = this.extractData(
            $,
            this.catalog.locator.detailUrl,
            this.ATTRIBUTE_TO_GET_DATA
        );

        newDetailUrlList.map((newDetailUrl): string => {
            return UrlHandler.sanitizeUrl(newDetailUrl);
        });
        newDetailUrlList = newDetailUrlList.filter(
            (newDetailUrl: string): boolean => this.existedDetailUrls.indexOf(newDetailUrl) < 0
        );

        for (const detailUrl of newDetailUrlList) {
            let detailUrlDoc: DetailUrl.DocumentInterface = this.detailUrlLogic.createDocument(
                this.catalogId,
                detailUrl
            );
            try {
                this.writeLog(
                    ScrapeConstant.LOG_ACTION.CREATE,
                    JSON.stringify(await this.detailUrlLogic.create(detailUrlDoc))
                );
            } catch (error) {
                this.writeErrorLog(
                    error,
                    ScrapeConstant.LOG_ACTION.CREATE,
                    JSON.stringify(detailUrlDoc)
                );
            }
        }

        let newPageNumberUrls: Array<string> = this.extractData(
            $,
            this.catalog.locator.pageNumber,
            this.ATTRIBUTE_TO_GET_DATA
        );

        newPageNumberUrls.map((newPageNumber): string => {
            return UrlHandler.sanitizeUrl(newPageNumber);
        });
        newPageNumberUrls = newPageNumberUrls.filter(
            (newPageNumberUrl: string): boolean => pageNumberScraped.indexOf(newPageNumberUrl) < 0
        );

        return newPageNumberUrls;
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

        let scrapeRawData = await new BgrScrape.RawData(this.catalogId);
        scrapeRawData.start();
        let checkLoop: Timeout = setInterval((): void => {
            if (scrapeRawData.isTaskRunning()) {
                return;
            }
            clearInterval(checkLoop);
            this.isRunning = false;
        }, 0);
    }
}
