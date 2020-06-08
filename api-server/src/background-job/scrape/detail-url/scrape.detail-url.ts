import { CatalogDocumentModel } from '@service/catalog/catalog.interface';
import { replaceMetaDataString } from '@util/helper/string';
import { sanitizeUrl } from '@util/helper/url';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import DetailUrlLogic from '@service/detail-url/detail-url.logic';
import { HostDocumentModel } from '@service/host/host.interface';
import { DetailUrlDocumentModel } from '@service/detail-url/detail-url.interface';
import { convertTotalSecondsToTime } from '@util/helper/datetime';
import ScrapeBase from '../scrape.base';
import { ScrapeDetailUrlConstantChatBotMessage } from './scrape.detail-url.constant';

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

            this.pageNumberQueue = [this.catalog.url];
            while (this.pageNumberQueue.length > 0) {
                const urlList: string[] = this.pageNumberQueue.splice(
                    0,
                    MAX_REQUEST
                );

                if (urlList.length === 0) {
                    continue;
                }

                const promises: Array<Promise<void>> = [];
                urlList.forEach((url) => {
                    this.scrapedPageNumber.push(url);
                    promises.push(this.scrapeAction(url));
                });
                try {
                    await Promise.all(promises);
                } catch (error) {
                    new ConsoleLog(
                        ConsoleConstant.Type.ERROR,
                        `Scrape detail URL - Error: ${
                            error.cause || error.message
                        }`
                    ).show();
                }
            }

            await this.finishAction();
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

    /**
     * @param $
     */
    private async handleSuccessRequest($: CheerioStatic): Promise<void> {
        let newDetailUrlList = ScrapeBase.extractData(
            $,
            this.catalog.locator.detailUrl,
            ATTRIBUTE_TO_GET_DATA
        );

        newDetailUrlList = newDetailUrlList.map((url) => sanitizeUrl(url));
        for (const newDetailUrl of newDetailUrlList) {
            const isExisted: boolean = await this.detailUrlLogic.isExisted({
                url: newDetailUrl,
            });

            if (!isExisted) {
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
    }
}
