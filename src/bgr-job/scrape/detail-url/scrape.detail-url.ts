import { DetailUrl } from '../../../services/detail-url/detail-url.index';
import { Catalog } from '../../../services/catalog/catalog.index';
import ScrapeBase from '../scrape.base';
import CatalogModelInterface from '../../../services/catalog/catalog.model.interface';
import DetailUrlModelInterface from '../../../services/detail-url/detail-url.model.interface';
import _ from 'lodash';
import StringHandler from '../../../util/string-handler/string-handler';
import { BgrQueue } from '../../queue/queue.index';
import { ScrapeDetailUrlConstantChatBotMessage } from './scrape.detail-url.constant';
import ChatBotTelegram from '../../../services/chatbot/chatBotTelegram';
import { BgrScrape } from '../scrape.index';
import delay from 'delay';

export default class ScrapeDetailUrl extends ScrapeBase {
    private readonly catalogId: number;
    private detailUrlLogic: DetailUrl.Logic = new DetailUrl.Logic();
    private catalogLogic: Catalog.Logic = new Catalog.Logic();
    private catalog: CatalogModelInterface | any;
    private existedDetailUrls: Array<DetailUrlModelInterface> | undefined;
    private saveQueue: BgrQueue.Save;
    private SAVE_QUEUE_DELAY: number = parseInt(
        process.env.SCRAPE_DETAIL_URL_SAVE_QUEUE_DELAY || '500'
    ); // ms
    private SAVE_AMOUNT: number = parseInt(
        process.env.SCRAPE_DETAIL_URL_SAVE_QUEUE_AMOUNT || '1000'
    ); // ms

    private readonly ATTRIBUTE_TO_GET_DATA: string = 'href';

    constructor(catalogId: number) {
        super();
        this.saveQueue = new BgrQueue.Save(this.SAVE_QUEUE_DELAY, this.SAVE_AMOUNT);
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
            this.existedDetailUrls = await this.detailUrlLogic.getAllWithConditions(
                queryConditions
            );

            await this.scrapeAction();
        } catch (error) {
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
    private async scrapeAction(): Promise<void> {
        let pageNumberQueue: Array<string> = [this.catalog.url];
        let pageNumberScraped: Array<string> = [];

        while (pageNumberQueue.length !== 0) {
            if (this.requestLimiter > this.MAX_REQUEST) {
                continue;
            }

            let currentUrl: string | undefined = pageNumberQueue.shift() || undefined;
            if (!currentUrl) {
                continue;
            }
            this.requestLimiter++;

            let $: CheerioStatic | undefined = await this.getBody(
                this.catalog.hostId.domain,
                currentUrl
            );

            if (!$) {
                continue;
            }

            pageNumberQueue = await this.handleSuccessRequest(
                $,
                currentUrl,
                pageNumberScraped,
                pageNumberQueue
            );

            this.requestLimiter--;
            await delay(this.REQUEST_DELAY);
        }

        this.finishAction();
        await new BgrScrape.RawData(this.catalogId).start();
    }

    /**
     * @param $
     * @param currentUrl
     * @param pageNumberScraped
     * @param pageNumberQueue
     */
    private async handleSuccessRequest(
        $: CheerioStatic,
        currentUrl: string,
        pageNumberScraped: Array<string>,
        pageNumberQueue: Array<string>
    ): Promise<Array<string>> {
        let pageNumberUrls: Array<string> = this.extractData(
            $,
            this.catalog.locator.pageNumber,
            this.ATTRIBUTE_TO_GET_DATA
        );
        let urlList: Array<string> = this.extractData(
            $,
            this.catalog.locator.detailUrl,
            this.ATTRIBUTE_TO_GET_DATA
        );

        let detailUrlDocumentList: Array<DetailUrlModelInterface> = [];
        urlList.forEach((url): void => {
            if (this.isDetailUrlExisted(this.existedDetailUrls, url)) {
                return;
            }

            detailUrlDocumentList.push(this.detailUrlLogic.createDocument(this.catalogId, url));
        });
        this.saveQueue.pushElement(detailUrlDocumentList);

        pageNumberScraped.push(currentUrl);
        return _.union(pageNumberQueue, _.difference(pageNumberUrls, pageNumberScraped));
    }

    /**
     * @param detailUrls
     * @param url
     *
     * @return boolean
     */
    private isDetailUrlExisted(
        detailUrls: Array<DetailUrlModelInterface> | undefined,
        url: string
    ): boolean {
        if (!detailUrls) {
            return false;
        }
        let index: number = detailUrls.findIndex((item): boolean => item.url === url);

        return index >= 0;
    }

    /**
     * Finish scrape action.
     */
    protected finishAction(): void {
        let isDone: boolean = false;
        while (!isDone) {
            if (this.saveQueue.getRemainTask() === 0) {
                isDone = true;
            }
            this.saveQueue.stop();
            this.exportLog(this.catalog);
            ChatBotTelegram.sendMessage(
                StringHandler.replaceString(ScrapeDetailUrlConstantChatBotMessage.FINISH, [
                    this.catalog.title,
                    this.catalog.id,
                    this.logInstance.getUrl(),
                ])
            );
        }
    }
}
