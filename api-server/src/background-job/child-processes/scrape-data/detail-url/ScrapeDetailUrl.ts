import { CatalogDocumentModel } from '@service/catalog/interface';
import { replaceMetaDataString } from '@util/helper/string';
import { sanitizeUrl } from '@util/helper/url';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import DetailUrlLogic from '@service/detail-url/DetailUrlLogic';
import { HostDocumentModel } from '@service/host/interface';
import { DetailUrlDocumentModel } from '@service/detail-url/interface';
import { convertTotalSecondsToTime } from '@util/helper/datetime';
import ScrapeBase from '../ScrapeBase';
import { ScrapeDetailUrlConstantChatBotMessage } from './constant';
import ScrapeRawData from '@background-job/child-processes/scrape-data/raw-data/ScrapeRawData';

const MAX_REQUEST = Number(
    process.env.BGR_SCRAPE_DETAIL_URL_MAX_REQUEST || '1'
);

const ATTRIBUTE_TO_GET_DATA = 'href';

export default class ScrapeDetailUrl extends ScrapeBase {
    private detailUrlLogic = DetailUrlLogic.getInstance();

    private pageNumberQueue: string[] = [];

    private scrapedPageNumber: string[] = [];

    constructor(private readonly catalog: CatalogDocumentModel) {
        super();
    }

    /**
     * Start detail URL scraper
     */
    public async start(): Promise<void> {
        try {
            this.startTime = process.hrtime();
            this.isRunning = true;

            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Scrape detail URL -> CID: ${this.catalog._id} - Start`
            ).show();
            await this.telegramChatBotInstance.sendMessage(
                replaceMetaDataString(
                    ScrapeDetailUrlConstantChatBotMessage.START,
                    [this.catalog.title, this.catalog.id]
                )
            );

            let requestCounter = 0;
            this.pageNumberQueue = [this.catalog.url];
            const loop = setInterval(async (): Promise<void> => {
                if (this.pageNumberQueue.length === 0 && requestCounter === 0) {
                    clearInterval(loop);
                    await this.finishAction();
                    return;
                }

                if (requestCounter > MAX_REQUEST) {
                    return;
                }

                const targetUrl = this.pageNumberQueue.shift();
                if (!targetUrl) {
                    return;
                }

                try {
                    requestCounter++;
                    this.scrapedPageNumber.push(targetUrl);
                    await this.scrapeAction(targetUrl);
                    requestCounter--;
                } catch (error) {
                    new ConsoleLog(
                        ConsoleConstant.Type.ERROR,
                        `Scrape detail URL - Error: ${
                            error.cause || error.message
                        }`
                    ).show();
                }
            }, 0);
        } catch (error) {
            await this.telegramChatBotInstance.sendMessage(
                replaceMetaDataString(error.message, [
                    this.catalog._id,
                    error.message,
                ])
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
    private async scrapeAction(url: string): Promise<void> {
        const $ = await this.getStaticBody(
            (this.catalog.hostId as HostDocumentModel).domain,
            url
        );

        if (!$) {
            return;
        }

        await this.handleSuccessRequest($);
    }

    private async handleSuccessRequest($: CheerioStatic): Promise<void> {
        let newDetailUrlList = ScrapeBase.extractData(
            $,
            this.catalog.locator.detailUrl,
            ATTRIBUTE_TO_GET_DATA
        );

        newDetailUrlList = newDetailUrlList.map((url) => sanitizeUrl(url));
        for (const newDetailUrl of newDetailUrlList) {
            const isExists: boolean = await this.detailUrlLogic.isExists({
                url: newDetailUrl,
            });

            if (!isExists) {
                try {
                    const createdDoc = await this.detailUrlLogic.create(({
                        catalogId: this.catalog._id,
                        url: newDetailUrl,
                    } as unknown) as DetailUrlDocumentModel);
                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Scrape detail URL -> DID: ${
                            createdDoc ? createdDoc._id : 'N/A'
                        }`
                    ).show();
                } catch (error) {
                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Scrape detail URL -> DID: 'N/A' - Error: ${error.message}`
                    ).show();
                }
            }
        }

        let newPageNumberUrls = ScrapeBase.extractData(
            $,
            this.catalog.locator.pageNumber,
            ATTRIBUTE_TO_GET_DATA
        );
        newPageNumberUrls = newPageNumberUrls.map((url) => sanitizeUrl(url));
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
        await this.telegramChatBotInstance.sendMessage(
            replaceMetaDataString(
                ScrapeDetailUrlConstantChatBotMessage.FINISH,
                [this.catalog.title, this.catalog.id]
            )
        );
        this.isRunning = false;
        const executeTime = convertTotalSecondsToTime(
            process.hrtime(this.startTime)[0]
        );
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Scrape detail URL -> CID: ${this.catalog._id} - Execute time: ${executeTime} - Complete`
        ).show();
        await new ScrapeRawData(this.catalog).start();
    }
}
