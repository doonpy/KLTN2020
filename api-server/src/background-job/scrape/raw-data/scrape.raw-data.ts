import ScrapeBase from '../scrape.base';
import RawDataLogic from '../../../service/raw-data/raw-data.logic';
import DateTime from '../../../util/datetime/datetime';
import StringHandler from '../../../util/helper/string-handler';
import { ScrapeRawDataConstant, ScrapeRawDataConstantChatBotMessage } from './scrape.raw-data.constant';
import ConsoleLog from '../../../util/console/console.log';
import ConsoleConstant from '../../../util/console/console.constant';
import DetailUrlLogic from '../../../service/detail-url/detail-url.logic';
import { CatalogDocumentModel } from '../../../service/catalog/catalog.interface';
import { DetailUrlDocumentModel } from '../../../service/detail-url/detail-url.interface';
import { PatternDocumentModel } from '../../../service/pattern/pattern.interface';
import { HostDocumentModel } from '../../../service/host/host.interface';
import { RawDataDocumentModel } from '../../../service/raw-data/raw-data.interface';
import RawDataConstant from '../../../service/raw-data/raw-data.constant';
import { convertAcreageValue, convertPriceValue } from './scrape.raw-data.helper';
import CommonConstant from '../../../common/common.constant';

export default class ScrapeRawData extends ScrapeBase {
    private readonly detailUrlLogic: DetailUrlLogic = DetailUrlLogic.getInstance();

    private readonly rawDataLogic: RawDataLogic = RawDataLogic.getInstance();

    private extractedDetailUrl: string[] = [];

    private readonly catalog: CatalogDocumentModel;

    private detailUrls: DetailUrlDocumentModel[] = [];

    private pattern: PatternDocumentModel;

    private readonly NOT_EXTRACTED: boolean = false;

    private readonly EXTRACTED: boolean = true;

    private readonly MAX_REQUEST_RETRIES: number = 3;

    private readonly MAX_REQUEST: number = parseInt(process.env.BGR_SCRAPE_RAW_DATA_MAX_REQUEST || '1', 10);

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

            new ConsoleLog(ConsoleConstant.Type.INFO, `Scrape raw data -> CID: ${this.catalog._id} - Start`).show();
            await this.telegramChatBotInstance.sendMessage(
                StringHandler.replaceString(ScrapeRawDataConstantChatBotMessage.START, [
                    this.catalog.title,
                    this.catalog.id,
                ])
            );

            const queryConditions: object = {
                catalogId: this.catalog._id,
                isExtracted: this.NOT_EXTRACTED,
                requestRetries: { $lt: this.MAX_REQUEST_RETRIES },
            };
            this.detailUrls = (await this.detailUrlLogic.getAll(undefined, undefined, queryConditions)).documents;

            if (this.detailUrls.length === 0) {
                await this.finishAction();
                return;
            }

            this.scrapeAction();
        } catch (error) {
            await this.telegramChatBotInstance.sendMessage(
                StringHandler.replaceString(error.message, [this.catalog._id, error.message])
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
        const loop: NodeJS.Timeout = setInterval(async (): Promise<void> => {
            if (this.detailUrls.length === 0 && this.requestCounter === 0) {
                clearInterval(loop);
                await this.finishAction();
            }

            if (this.requestCounter > this.MAX_REQUEST) {
                return;
            }

            const currentDetailUrlDocument: DetailUrlDocumentModel | undefined = this.detailUrls.shift();
            if (!currentDetailUrlDocument) {
                return;
            }

            const currentUrl: string = currentDetailUrlDocument.url;
            this.extractedDetailUrl.push(currentDetailUrlDocument.url);

            this.requestCounter += 1;
            const $: CheerioStatic | undefined = await this.getStaticBody(
                (this.catalog.hostId as HostDocumentModel).domain,
                currentUrl
            );

            if (!$) {
                await this.handleFailedRequest(currentDetailUrlDocument);
            } else {
                await this.handleSuccessRequest($, currentDetailUrlDocument);
            }
            this.requestCounter -= 1;
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
        }: {
            propertyType: string;
            postDate: { locator: string; delimiter: string; format: string };
            title: string;
            describe: string;
            price: string;
            acreage: string;
            address: string;
        } = this.pattern.mainLocator;
        const propertyTypeData: string = StringHandler.removeBreakLineAndTrim(
            ScrapeBase.extractData($, propertyType).join('. ')
        );
        const postDateData: string = StringHandler.removeBreakLineAndTrim(
            ScrapeBase.extractData($, postDate.locator).join('. ')
        );
        const titleData: string = StringHandler.removeBreakLineAndTrim(ScrapeBase.extractData($, title).join('. '));
        const describeData: string = StringHandler.removeBreakLineAndTrim(
            ScrapeBase.extractData($, describe).join('. ')
        );
        const priceData: string = StringHandler.removeBreakLineAndTrim(ScrapeBase.extractData($, price).join('. '));
        const acreageData: string = StringHandler.removeBreakLineAndTrim(ScrapeBase.extractData($, acreage).join('. '));
        const addressData: string = StringHandler.removeBreakLineAndTrim(
            ScrapeBase.extractData($, address)
                .map((item) => item.replace(/^[^\d\w]+|[^\d\w]+$/g, ' '))
                .join('. ')
        );
        const othersData: {
            name: string;
            value: string;
        }[] = this.pattern.subLocator
            .map((subLocatorItem): {
                name: string;
                value: string;
            } =>
                Object({
                    name: StringHandler.removeBreakLineAndTrim(
                        ScrapeBase.extractData($, subLocatorItem.name).join('. ')
                    ),
                    value: StringHandler.removeBreakLineAndTrim(
                        ScrapeBase.extractData($, subLocatorItem.value).join('. ')
                    ),
                })
            )
            .filter((item) => !!item.value);

        const rawData: RawDataDocumentModel = this.handleScrapedData(
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
        currentDetailUrlDocument.requestRetries += 1;

        if (this.isHasEmptyProperty(rawData)) {
            try {
                await this.detailUrlLogic.update(currentDetailUrlDocument._id, currentDetailUrlDocument);
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Scrape raw data -> DID: ${currentDetailUrlDocument._id} - Error: Invalid value.`
                ).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Scrape raw data -> DID: ${currentDetailUrlDocument._id} - Error: ${error.cause || error.message}`
                ).show();
            }
            return;
        }

        try {
            const result: (DetailUrlDocumentModel | RawDataDocumentModel)[] = await Promise.all([
                this.detailUrlLogic.update(currentDetailUrlDocument._id, currentDetailUrlDocument),
                this.rawDataLogic.create(rawData),
            ]);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Scrape raw data -> DID: ${result[0]._id} -> RID: ${result[1] ? result[1]._id : 'N/A'}`
            ).show();
        } catch (error) {
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Scrape raw data -> DID: ${currentDetailUrlDocument._id} - Error: ${error.cause || error.message}`
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
            const value: any = input[property];
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
                    if ((JSON.stringify(value).match(/""|null/g) || []).length > 0) {
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
    protected async handleFailedRequest(currentDetailUrlDocument: DetailUrlDocumentModel): Promise<void> {
        currentDetailUrlDocument.requestRetries += 1;
        if (currentDetailUrlDocument.requestRetries < this.MAX_REQUEST_RETRIES) {
            this.detailUrls.push(currentDetailUrlDocument);
        } else {
            try {
                await this.detailUrlLogic.update(currentDetailUrlDocument._id, currentDetailUrlDocument);
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
        const transactionType: number = ScrapeRawDataConstant.RENT_TRANSACTION_PATTERN.test(propertyTypeData)
            ? CommonConstant.TRANSACTION_TYPE[1].id
            : CommonConstant.TRANSACTION_TYPE[0].id;

        const propertyType: number = RawDataLogic.getInstance().getPropertyTypeIndex(propertyTypeData);

        const postDateString: string =
            (postDateData.match(ScrapeRawDataConstant.POST_DATE_PATTERN) || []).shift() || '';
        let postDate: Date = DateTime.convertStringToDate(
            postDateString,
            this.pattern.mainLocator.postDate.format,
            this.pattern.mainLocator.postDate.delimiter
        );
        if (postDate.toString() === 'Invalid Date') {
            postDate = new Date();
        }

        let priceString = '';
        let priceTimeUnit = '';
        if (transactionType === CommonConstant.TRANSACTION_TYPE[0].id) {
            priceString = (priceData.match(ScrapeRawDataConstant.SALE_PRICE_PATTERN) || []).shift() || '';
        } else {
            priceString = (priceData.match(ScrapeRawDataConstant.RENT_PRICE_PATTERN) || []).shift() || '';
            priceTimeUnit = (priceData.match(ScrapeRawDataConstant.PRICE_TIME_UNIT_PATTERN) || []).shift() || '';
        }
        const priceUnit: string =
            (priceString.match(ScrapeRawDataConstant.PRICE_VALUE_UNIT_PATTERN) || []).shift() || '';
        const priceValue: number = convertPriceValue(
            Number((priceString.match(ScrapeRawDataConstant.VALUE_PATTERN) || []).shift()),
            priceUnit,
            'nghìn'
        );
        const priceCurrency: string = (priceString.match(/$/) || []).shift() ? 'usd' : 'vnd';
        const price: { value: number; currency: string; timeUnit: number } = {
            value: priceValue,
            currency: priceCurrency,
            timeUnit:
                RawDataConstant.PRICE_TIME_UNIT.find((item): boolean => item.wording.indexOf(priceTimeUnit) !== -1)
                    ?.id || -1,
        };
        if (price.timeUnit === -1) {
            if (transactionType === CommonConstant.TRANSACTION_TYPE[0].id) {
                delete price.timeUnit;
            } else {
                price.timeUnit = RawDataConstant.PRICE_TIME_UNIT[1].id;
            }
        }

        const acreageString: string = (acreageData.match(ScrapeRawDataConstant.ACREAGE_PATTERN) || []).shift() || '';
        const acreageMeasureUnit: string =
            (acreageString.match(ScrapeRawDataConstant.ACREAGE_MEASURE_UNIT_PATTERN) || []).shift() || '';
        const acreageValue: number =
            acreageMeasureUnit === 'km²' || acreageMeasureUnit === 'km2'
                ? convertAcreageValue(
                      Number((acreageString.match(ScrapeRawDataConstant.VALUE_PATTERN) || []).shift()),
                      'km²',
                      'm²'
                  )
                : Number((acreageString.match(ScrapeRawDataConstant.VALUE_PATTERN) || []).shift());
        const acreage: { value: number; measureUnit: string } = {
            value: acreageValue,
            measureUnit: 'm²',
        };

        return ({
            detailUrlId,
            transactionType,
            propertyType,
            postDate: postDate.toISOString(),
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
            StringHandler.replaceString(ScrapeRawDataConstantChatBotMessage.FINISH, [
                this.catalog.title,
                this.catalog.id,
            ])
        );
        this.isRunning = false;
        const executeTime: string = DateTime.convertTotalSecondsToTime(process.hrtime(this.startTime)[0]);
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
