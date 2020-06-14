import RawDataLogic from '@service/raw-data/RawDataLogic';
import {
    convertStringToDate,
    convertTotalSecondsToTime,
} from '@util/helper/datetime';
import {
    removeBreakLineAndTrim,
    removeSpecialCharacterAtHeadAndTail,
    replaceMetaDataString,
} from '@util/helper/string';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import DetailUrlLogic from '@service/detail-url/DetailUrlLogic';
import { CatalogDocumentModel } from '@service/catalog/interface';
import { DetailUrlDocumentModel } from '@service/detail-url/interface';
import { PatternDocumentModel } from '@service/pattern/interface';
import { HostDocumentModel } from '@service/host/interface';
import { RawDataDocumentModel } from '@service/raw-data/interface';
import CommonConstant from '@common/constant';
import ScrapeBase from '../ScrapeBase';
import { acreageHandler, priceHandler } from './helper';
import {
    ScrapeRawDataConstant,
    ScrapeRawDataConstantChatBotMessage,
} from './constant';

const NOT_EXTRACTED = false;
const EXTRACTED = true;
const MAX_REQUEST_RETRIES = Number(
    process.env.BGR_SCRAPE_RAW_DATA_MAX_REQUEST_RETRIES || '3'
);
const MAX_REQUEST = Number(process.env.BGR_SCRAPE_RAW_DATA_MAX_REQUEST || '1');

export default class ScrapeRawData extends ScrapeBase {
    private readonly detailUrlLogic = DetailUrlLogic.getInstance();

    private readonly rawDataLogic = RawDataLogic.getInstance();

    private readonly catalog: CatalogDocumentModel;

    private detailUrls: DetailUrlDocumentModel[] = [];

    private pattern: PatternDocumentModel;

    constructor(catalog: CatalogDocumentModel) {
        super();
        this.catalog = catalog;
        this.pattern = catalog.patternId as PatternDocumentModel;
    }

    /**
     * Start raw data scraper
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
                isExtracted: NOT_EXTRACTED,
                requestRetries: { $lt: MAX_REQUEST_RETRIES },
            };
            this.detailUrls = (
                await this.detailUrlLogic.getAll({ conditions })
            ).documents;

            if (this.detailUrls.length === 0) {
                await this.finishAction();
                return;
            }

            let requestCounter = 0;
            const loop = setInterval(async (): Promise<void> => {
                if (this.detailUrls.length === 0 && requestCounter === 0) {
                    clearInterval(loop);
                    await this.finishAction();
                    return;
                }

                if (requestCounter > MAX_REQUEST) {
                    return;
                }

                const targetDetailUrl = this.detailUrls.shift();
                if (!targetDetailUrl) {
                    return;
                }

                requestCounter++;
                await this.scrapeAction(targetDetailUrl);
                requestCounter--;
            }, 0);
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
     */
    private async scrapeAction(
        detailUrl: DetailUrlDocumentModel
    ): Promise<void> {
        const url: string = detailUrl.url;
        const $ = await this.getStaticBody(
            (this.catalog.hostId as HostDocumentModel).domain,
            url
        );

        if (!$) {
            await this.handleFailedRequest(detailUrl);
        } else {
            await this.handleSuccessRequest($, detailUrl);
        }
    }

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
        currentDetailUrlDocument.isExtracted = EXTRACTED;
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

    protected async handleFailedRequest(
        currentDetailUrlDocument: DetailUrlDocumentModel
    ): Promise<void> {
        currentDetailUrlDocument.requestRetries++;
        if (currentDetailUrlDocument.requestRetries < MAX_REQUEST_RETRIES) {
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

    private handleScrapedData(
        detailUrlId: number,
        propertyTypeData: string,
        postDateData: string,
        titleData: string,
        describeData: string,
        priceData: string,
        acreageData: string,
        addressData: string,
        othersData: Array<{ name: string; value: string }>
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
}
