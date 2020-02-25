import DetailUrlLogic from '../../../modules/detail-url/detail-url.logic';
import DetailModel from '../../../modules/detail-url/detail-url.model';
import CatalogLogic from '../../../modules/catalog/catalog.logic';
import ScrapeBase from '../scrape.base';
import CatalogModelInterface from '../../../modules/catalog/catalog.model.interface';
import DetailUrlModelInterface from '../../../modules/detail-url/detail-url.model.interface';
import Timeout = NodeJS.Timeout;
import _ from 'lodash';
import { replaceString } from '../../../util/replace-message';
import { DetailUrlScrapeMessage } from './detail-url.scrape.message';

class DetailUrlScrape extends ScrapeBase {
    private readonly catalogId: number;
    private detailUrlLogic: DetailUrlLogic = new DetailUrlLogic();
    private catalogLogic: CatalogLogic = new CatalogLogic();
    private catalog: CatalogModelInterface | any;
    private existedDetailUrls: Array<DetailUrlModelInterface> | undefined;

    private readonly ATTRIBUTE_TO_GET_DATA: string = 'href';

    constructor(catalogId: number) {
        super();
        this.logInstance.initLogFolder('detail-url-scrape', 'txt');
        this.catalogId = catalogId;
    }

    /**
     * Start detail URL scraper
     */
    public async start(): Promise<void> {
        try {
            this.startTime = process.hrtime();
            this.catalog = await this.catalogLogic.getById(this.catalogId);
            let queryConditions: object = {
                catalogId: this.catalogId,
            };
            this.existedDetailUrls = await this.detailUrlLogic.getAllWithConditions(
                queryConditions
            );

            this.scrapeAction();
            this.saveAction();
            this.telegramChatBot.sendMessage(
                replaceString(DetailUrlScrapeMessage.START_SCRAPE, [
                    this.catalog.title,
                    this.catalog.id,
                ])
            );
        } catch (error) {
            this.logInstance.addLine(`- ERROR: ${error.message}`);
            this.logInstance.addLine(`- CATALOG ID: ${this.catalogId}`);
            this.logInstance.exportFile();
            this.telegramChatBot.sendMessage(
                replaceString(DetailUrlScrapeMessage.ERROR, [
                    this.catalogId,
                    error.message,
                    this.FULL_HOST_URI + '/' + this.logInstance.getFullStaticPath(),
                ])
            );
        }
    }

    /**
     * Scrape action.
     */
    private scrapeAction(): void {
        this.isScrapeDone = false;
        let pageNumberQueue: Array<string> = [this.catalog.url];
        let pageNumberScraped: Array<string> = [];
        let requestCounter: number = 0;

        const scrapeLoop: Timeout = setInterval(async (): Promise<void> => {
            if (pageNumberQueue.length === 0 || pageNumberScraped.length > 20) {
                clearInterval(scrapeLoop);
                this.finishAction(pageNumberScraped.length);
                return;
            }

            if (requestCounter > this.MAX_REQUEST) {
                return;
            }

            requestCounter++;

            let currentUrl: string | undefined = pageNumberQueue.shift() || undefined;
            if (!currentUrl) {
                return;
            }

            let $: CheerioStatic | undefined = await this.getBody(
                this.catalog.hostId.domain + currentUrl
            );

            if (!$) {
                return;
            }

            let pageNumberUrls: Array<string> = await this.extractData(
                $,
                this.catalog.locator.pageNumber,
                this.ATTRIBUTE_TO_GET_DATA
            );
            let urlList: Array<string> = await this.extractData(
                $,
                this.catalog.locator.detailUrl,
                this.ATTRIBUTE_TO_GET_DATA
            );

            urlList.forEach((url): void => {
                if (this.isDetailUrlExisted(this.existedDetailUrls, url)) {
                    return;
                }

                this.saveQueue.push(
                    new DetailModel({
                        catalogId: this.catalog.id,
                        url: url,
                    })
                );
            });

            pageNumberScraped.push(currentUrl);
            pageNumberQueue = _.union(
                pageNumberQueue,
                _.difference(pageNumberUrls, pageNumberScraped)
            );

            this.logInstance.addLine(`- OK: '${currentUrl}'`);

            requestCounter--;
        }, this.REQUEST_DELAY);
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
     * @param successRequestCounter
     */
    private addSummaryLog(successRequestCounter: number): void {
        let endTime: [number, number] = process.hrtime(this.startTime);
        this.logInstance.addLine(`-------- SUMMARY -------`);
        this.logInstance.addLine(
            replaceString(`-> EXECUTION TIME: %is %ims`, [endTime[0], endTime[1] / 1000000])
        );
        this.logInstance.addLine(`-> CATALOG: ${this.catalog.title} (ID: ${this.catalog._id})`);
        this.logInstance.addLine(`-> HOST DOMAIN: ${this.catalog.hostId.domain}`);
        this.logInstance.addLine(`-> SUCCESS REQUEST(S): ${successRequestCounter}`);
        this.logInstance.addLine(`-> FAILED REQUEST(S): ${this.failedRequestCounter}`);
    }

    /**
     * Finish action.
     *
     * @param successRequestCounter
     */
    protected finishAction(successRequestCounter: number): void {
        this.isScrapeDone = true;
        this.addSummaryLog(successRequestCounter);
        this.logInstance.exportFile();
        this.telegramChatBot.sendMessage(
            replaceString(DetailUrlScrapeMessage.FINISH_SCRAPE, [
                this.catalog.title,
                this.catalog.id,
                this.FULL_HOST_URI + '/' + this.logInstance.getFullStaticPath(),
            ])
        );
    }
}

export default DetailUrlScrape;
