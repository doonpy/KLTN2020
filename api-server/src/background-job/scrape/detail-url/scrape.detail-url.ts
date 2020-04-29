import ScrapeBase from '../scrape.base';
import { CatalogDocumentModel } from '../../../service/catalog/catalog.interface';
import StringHandler from '../../../util/helper/string-handler';
import { ScrapeDetailUrlConstantChatBotMessage } from './scrape.detail-url.constant';
import UrlHandler from '../../../util/url-handler/url-handler';
import ConsoleLog from '../../../util/console/console.log';
import ConsoleConstant from '../../../util/console/console.constant';
import DetailUrlLogic from '../../../service/detail-url/detail-url.logic';
import { HostDocumentModel } from '../../../service/host/host.interface';
import { DetailUrlDocumentModel } from '../../../service/detail-url/detail-url.interface';
import ScrapeRawData from '../raw-data/scrape.raw-data';
import DateTime from '../../../util/datetime/datetime';

export default class ScrapeDetailUrl extends ScrapeBase {
    private detailUrlLogic: DetailUrlLogic = DetailUrlLogic.getInstance();

    private readonly catalog: CatalogDocumentModel;

    private pageNumberQueue: string[] = [];

    private scrapedPageNumber: string[] = [];

    private readonly MAX_REQUEST: number = parseInt(process.env.SCRAPE_DETAIL_URL_MAX_REQUEST || '1', 10);

    private readonly ATTRIBUTE_TO_GET_DATA: string = 'href';

    constructor(catalog: CatalogDocumentModel) {
        super();
        this.catalog = catalog;
    }

    /**
     * Start detail URL scraper
     */
    public async start(): Promise<void> {
        try {
            this.startTime = process.hrtime();
            this.isRunning = true;

            new ConsoleLog(ConsoleConstant.Type.INFO, `Scrape detail URL -> CID: ${this.catalog._id} - Start`).show();
            await this.telegramChatBotInstance.sendMessage(
                StringHandler.replaceString(ScrapeDetailUrlConstantChatBotMessage.START, [
                    this.catalog.title,
                    this.catalog.id,
                ])
            );

            this.scrapeAction();
        } catch (error) {
            await this.telegramChatBotInstance.sendMessage(
                StringHandler.replaceString(error.message, [this.catalog._id, error.message])
            );
            this.isRunning = false;
            throw new Error(
                `Scrape detail URL of catalog ${this.catalog?.title} (ID:${this.catalog._id}) failed.\nError: ${error.message}`
            );
        }
    }

    /**
     * Scrape action.
     */
    private scrapeAction(): void {
        this.pageNumberQueue = [this.catalog.url];

        const loop: NodeJS.Timeout = setInterval(async (): Promise<void> => {
            if (this.pageNumberQueue.length === 0 && this.requestCounter === 0) {
                clearInterval(loop);
                await this.finishAction(this.catalog);
            }

            if (this.requestCounter > this.MAX_REQUEST) {
                return;
            }

            const currentUrl: string | undefined = this.pageNumberQueue.shift();
            if (!currentUrl) {
                return;
            }

            this.requestCounter += 1;
            const $: CheerioStatic | undefined = await this.getStaticBody(
                (this.catalog.hostId as HostDocumentModel).domain,
                currentUrl
            );
            this.scrapedPageNumber.push(currentUrl);

            if (!$) {
                this.requestCounter -= 1;
                return;
            }

            await this.handleSuccessRequest($);
            this.requestCounter -= 1;
        }, this.REQUEST_DELAY);
    }

    /**
     * @param $
     */
    private async handleSuccessRequest($: CheerioStatic): Promise<void> {
        let newDetailUrlList: string[] = ScrapeBase.extractData(
            $,
            this.catalog.locator.detailUrl,
            this.ATTRIBUTE_TO_GET_DATA
        );

        newDetailUrlList = newDetailUrlList.map((url): string => UrlHandler.sanitizeUrl(url));
        for (const newDetailUrl of newDetailUrlList) {
            if (!(await this.detailUrlLogic.isExistsWithUrl(newDetailUrl))) {
                try {
                    const createdDoc: DetailUrlDocumentModel = await this.detailUrlLogic.create(({
                        catalogId: this.catalog._id,
                        url: newDetailUrl,
                    } as unknown) as DetailUrlDocumentModel);
                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Scrape detail URL -> DID: ${createdDoc ? createdDoc._id : 'N/A'}`
                    ).show();
                } catch (error) {
                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Scrape detail URL -> DID: 'N/A' - Error: ${error.message}`
                    ).show();
                }
            }
        }

        let newPageNumberUrls: string[] = ScrapeBase.extractData(
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
    protected async finishAction(catalog: CatalogDocumentModel): Promise<void> {
        await this.telegramChatBotInstance.sendMessage(
            StringHandler.replaceString(ScrapeDetailUrlConstantChatBotMessage.FINISH, [catalog.title, catalog.id])
        );
        this.isRunning = false;
        const executeTime: string = DateTime.convertTotalSecondsToTime(process.hrtime(this.startTime)[0]);
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Scrape detail URL -> CID: ${catalog._id} - Execute time: ${executeTime} - Complete`
        ).show();
        await new ScrapeRawData(this.catalog).start();
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
    public getCatalog(): CatalogDocumentModel {
        return this.catalog;
    }
}
