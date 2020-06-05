import RawDataLogic from '@service/raw-data/raw-data.logic';
import {
    convertStringToDate,
    convertTotalSecondsToTime,
} from '@util/helper/datetime';
import {
    removeBreakLineAndTrim,
    removeSpecialCharacterAtHeadAndTail,
    replaceMetaDataString,
} from '@util/helper/string';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import DetailUrlLogic from '@service/detail-url/detail-url.logic';
import { CatalogDocumentModel } from '@service/catalog/catalog.interface';
import { DetailUrlDocumentModel } from '@service/detail-url/detail-url.interface';
import { PatternDocumentModel } from '@service/pattern/pattern.interface';
import { HostDocumentModel } from '@service/host/host.interface';
import { RawDataDocumentModel } from '@service/raw-data/raw-data.interface';
import CommonConstant from '@common/common.constant';
import ScrapeBase from '../scrape.base';
import {
    acreageHandler,
    convertAcreageValueToMeter,
    convertPriceValueToK,
    priceHandler,
} from './scrape.raw-data.helper';
import {
    ScrapeRawDataConstant,
    ScrapeRawDataConstantChatBotMessage,
} from './scrape.raw-data.constant';

export default class ScrapeRawData extends ScrapeBase {
    private readonly detailUrlLogic = DetailUrlLogic.getInstance();

    private readonly rawDataLogic = RawDataLogic.getInstance();

    private extractedDetailUrl: string[] = [];

    private readonly catalog: CatalogDocumentModel;

    private detailUrls: DetailUrlDocumentModel[] = [];

    private pattern: PatternDocumentModel;

    private readonly NOT_EXTRACTED = false;

    private readonly EXTRACTED = true;

    private readonly MAX_REQUEST_RETRIES = 3;

    private readonly MAX_REQUEST = Number(
        process.env.BGR_SCRAPE_RAW_DATA_MAX_REQUEST || '1'
    );

    constructor(catalog: CatalogDocumentModel) {
        super();
        this.catalog = catalog;
        this.pattern = catalog.patternId as PatternDocumentModel;
    }

    /**
     * Start raw data scraper
     *
     * @return {Promise<void>}
     */
    public async start(): Promise<void> {
        try {
            this.startTime = process.hrtime();
            this.isRunning = true;

            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Scrape raw data -> CID: ${this.catalog._id} - Start`
            ).show();
            await this.telegramChatBotInstance.sendMessage(
                replaceMetaDataString(
                    ScrapeRawDataConstantChatBotMessage.START,
                    [this.catalog.title, this.catalog.id]
                )
            );

            const conditions = {
                catalogId: this.catalog._id,
                isExtracted: this.NOT_EXTRACTED,
                requestRetries: { $lt: this.MAX_REQUEST_RETRIES },
            };
            this.detailUrls = (
                await this.detailUrlLogic.getAll({ conditions })
            ).documents;

            if (this.detailUrls.length === 0) {
                await this.finishAction();
                return;
            }

            this.scrapeAction();
        } catch (error) {
            await this.telegramChatBotInstance.sendMessage(
                replaceMetaDataString(error.message, [
                    this.catalog._id,
                    error.message,
                ])
            );
            throw new Error(
                `Scrape raw data of catalog ${this.catalog?.title} (ID:${this.catalog._id}) failed.\nError: ${error.message}`
            );
        }
    }

    /**
     * Scrape action with loop
     *
     * @return {void}
     */
    private scrapeAction(): void {
        const loop = setInterval(async (): Promise<void> => {
            if (this.detailUrls.length === 0 && this.requestCounter === 0) {
                clearInterval(loop);
                await this.finishAction();
            }

            if (this.requestCounter > this.MAX_REQUEST) {
                return;
            }

            const currentDetailUrlDocument = this.detailUrls.shift();
            if (!currentDetailUrlDocument) {
                return;
            }

            const currentUrl = currentDetailUrlDocument.url;
            this.extractedDetailUrl.push(currentDetailUrlDocument.url);

            this.requestCounter++;
            const $ = await this.getStaticBody(
                (this.catalog.hostId as HostDocumentModel).domain,
                currentUrl
            );

            try {
                if (!$) {
                    await this.handleFailedRequest(currentDetailUrlDocument);
                } else {
                    await this.handleSuccessRequest(
                        $,
                        currentDetailUrlDocument
                    );
                }
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Scrape raw data - DID: ${
                        currentDetailUrlDocument._id
                    } - Error: ${error.cause || error.message}`
                ).show();
            }
            this.requestCounter--;
        }, this.REQUEST_DELAY);
    }

    /**
     * @param {CheerioStatic} $
     * @param {DetailUrlDocumentModel} currentDetailUrlDocument
     *
     * @return {Promise<void>}
     */
    protected async handleSuccessRequest(
        $: CheerioStatic,
        currentDetailUrlDocument: DetailUrlDocumentModel
    ): Promise<void> {
        const {
            propertyType,
            postDate,
            title,
            describe,
            price,
            acreage,
            address,
        } = this.pattern.mainLocator;
        const propertyTypeData = removeBreakLineAndTrim(
            ScrapeBase.extractData($, propertyType).join('. ')
        );
        const postDateData = removeBreakLineAndTrim(
            ScrapeBase.extractData($, postDate.locator).join('. ')
        );
        const titleData = removeBreakLineAndTrim(
            ScrapeBase.extractData($, title).join('. ')
        );
        const describeData = removeBreakLineAndTrim(
            ScrapeBase.extractData($, describe).join('. ')
        );
        const priceData = removeBreakLineAndTrim(
            ScrapeBase.extractData($, price).join('. ')
        );
        const acreageData = removeBreakLineAndTrim(
            ScrapeBase.extractData($, acreage).join('. ')
        );
        const addressData = removeBreakLineAndTrim(
            ScrapeBase.extractData($, address)
                .map((item) => removeSpecialCharacterAtHeadAndTail(item))
                .join('. ')
        );
        const othersData = this.pattern.subLocator
            .map((subLocatorItem) =>
                Object({
                    name: removeBreakLineAndTrim(
                        ScrapeBase.extractData($, subLocatorItem.name).join(
                            '. '
                        )
                    ),
                    value: removeBreakLineAndTrim(
                        ScrapeBase.extractData($, subLocatorItem.value).join(
                            '. '
                        )
                    ),
                })
            )
            .filter((item) => !!item.value);

        const rawData = this.handleScrapedData(
            currentDetailUrlDocument._id,
            propertyTypeData,
            postDateData,
            titleData,
            describeData,
            priceData,
            acreageData,
            addressData,
            othersData
        );
        currentDetailUrlDocument.isExtracted = this.EXTRACTED;
        currentDetailUrlDocument.requestRetries++;

        if (this.isHasEmptyProperty(rawData)) {
            try {
                await this.detailUrlLogic.update(
                    currentDetailUrlDocument._id,
                    currentDetailUrlDocument
                );
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Scrape raw data -> DID: ${currentDetailUrlDocument._id} - Error: Invalid value.`
                ).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Scrape raw data -> DID: ${
                        currentDetailUrlDocument._id
                    } - Error: ${error.cause || error.message}`
                ).show();
            }
            return;
        }

        try {
            const result = await Promise.all([
                this.detailUrlLogic.update(
                    currentDetailUrlDocument._id,
                    currentDetailUrlDocument
                ),
                this.rawDataLogic.create(rawData),
            ]);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Scrape raw data -> DID: ${result[0]._id} -> RID: ${
                    result[1] ? result[1]._id : 'N/A'
                }`
            ).show();
        } catch (error) {
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Scrape raw data -> DID: ${
                    currentDetailUrlDocument._id
                } - Error: ${error.cause || error.message}`
            ).show();
        }
    }

    /**
     * @param { [key: string]: any } input
     *
     * @return {boolean}
     */
    private isHasEmptyProperty(input: { [key: string]: any }): boolean {
        const propertyList: string[] = [
            'transactionType',
            'propertyType',
            'detailUrlId',
            'postDate',
            'title',
            'describe',
            'price',
            'acreage',
            'address',
            'others',
        ];
        for (const property of propertyList) {
            const value = input[property];
            switch (typeof value) {
                case 'string':
                    if (!value) {
                        return true;
                    }
                    break;
                case 'number':
                    if (!value && value !== 0) {
                        return true;
                    }
                    break;
                case 'object':
                    if (Object.keys(value).length === 0) {
                        break;
                    }
                    if (
                        (JSON.stringify(value).match(/""|null/g) || []).length >
                        0
                    ) {
                        return true;
                    }
                    break;
                default:
                    return true;
            }
        }

        return false;
    }

    /**
     * @param currentDetailUrlDocument
     */
    protected async handleFailedRequest(
        currentDetailUrlDocument: DetailUrlDocumentModel
    ): Promise<void> {
        currentDetailUrlDocument.requestRetries++;
        if (
            currentDetailUrlDocument.requestRetries < this.MAX_REQUEST_RETRIES
        ) {
            this.detailUrls.push(currentDetailUrlDocument);
        } else {
            try {
                await this.detailUrlLogic.update(
                    currentDetailUrlDocument._id,
                    currentDetailUrlDocument
                );
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Scrape raw data -> DID: ${currentDetailUrlDocument._id}`
                ).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Scrape raw data -> DID: ${currentDetailUrlDocument._id} - Error: ${error.message}`
                ).show();
            }
        }
    }

    /**
     *
     * @return RawDataDocumentModel
     * @param detailUrlId
     * @param propertyTypeData
     * @param postDateData
     * @param titleData
     * @param describeData
     * @param priceData
     * @param acreageData
     * @param addressData
     * @param othersData
     */
    private handleScrapedData(
        detailUrlId: number,
        propertyTypeData: string,
        postDateData: string,
        titleData: string,
        describeData: string,
        priceData: string,
        acreageData: string,
        addressData: string,
        othersData: { name: string; value: string }[]
    ): RawDataDocumentModel {
        const transactionType = ScrapeRawDataConstant.RENT_TRANSACTION_PATTERN.test(
            propertyTypeData
        )
            ? CommonConstant.TRANSACTION_TYPE[1].id
            : CommonConstant.TRANSACTION_TYPE[0].id;

        const propertyType = RawDataLogic.getInstance().getPropertyTypeIndex(
            propertyTypeData
        );

        const postDateString =
            postDateData
                .match(ScrapeRawDataConstant.POST_DATE_PATTERN)
                ?.shift() || '';
        const postDate = convertStringToDate(
            postDateString,
            this.pattern.mainLocator.postDate.format,
            this.pattern.mainLocator.postDate.delimiter
        );

        const acreage = acreageHandler(acreageData);
        const price = priceHandler(priceData, transactionType, acreage.value);

        return ({
            detailUrlId,
            transactionType,
            propertyType,
            postDate,
            title: titleData,
            describe: describeData,
            price,
            acreage,
            address: addressData,
            others: othersData,
        } as unknown) as RawDataDocumentModel;
    }

    /**
     * Finish action
     */
    public async finishAction(): Promise<void> {
        await this.telegramChatBotInstance.sendMessage(
            replaceMetaDataString(ScrapeRawDataConstantChatBotMessage.FINISH, [
                this.catalog.title,
                this.catalog.id,
            ])
        );
        this.isRunning = false;
        const executeTime = convertTotalSecondsToTime(
            process.hrtime(this.startTime)[0]
        );
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Scrape raw data -> CID: ${this.catalog._id} - Execute time: ${executeTime} - Complete`
        ).show();
        process.exit(0);
    }

    /**
     * Get page number scraped
     */
    public getTargetList(): string[] {
        return this.extractedDetailUrl;
    }

    /**
     * Get catalog target
     */
    public getCatalog(): CatalogDocumentModel {
        return this.catalog;
    }
}
