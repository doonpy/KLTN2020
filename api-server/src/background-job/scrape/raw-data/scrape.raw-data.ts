import ScrapeBase from '../scrape.base';
import RawDataLogic from '../../../service/raw-data/raw-data.logic';
import DateTime from '../../../util/datetime/datetime';
import StringHandler from '../../../util/string-handler/string-handler';
import { ScrapeRawDataConstant, ScrapeRawDataConstantChatBotMessage } from './scrape.raw-data.constant';
import ScrapeConstant from '../scrape.constant';
import ConsoleLog from '../../../util/console/console.log';
import ConsoleConstant from '../../../util/console/console.constant';
import DetailUrlLogic from '../../../service/detail-url/detail-url.logic';
import { CatalogDocumentModel } from '../../../service/catalog/catalog.interface';
import { DetailUrlDocumentModel } from '../../../service/detail-url/detail-url.interface';
import { PatternDocumentModel } from '../../../service/pattern/pattern.interface';
import { HostDocumentModel } from '../../../service/host/host.interface';
import { RawDataDocumentModel } from '../../../service/raw-data/raw-data.interface';
import RawDataConstant from '../../../service/raw-data/raw-data.constant';

export default class ScrapeRawData extends ScrapeBase {
    private readonly detailUrlLogic: DetailUrlLogic = DetailUrlLogic.getInstance();

    private readonly rawDataLogic: RawDataLogic = RawDataLogic.getInstance();

    private extractedDetailUrl: string[] = [];

    private readonly catalog: CatalogDocumentModel;

    private detailUrls: DetailUrlDocumentModel[] = [];

    private pattern: PatternDocumentModel;

    private saveAmount = 0;

    private readonly NOT_EXTRACTED: boolean = false;

    private readonly EXTRACTED: boolean = true;

    private readonly MAX_REQUEST_RETRIES: number = 3;

    private readonly MAX_REQUEST: number = parseInt(process.env.SCRAPE_RAW_DATA_MAX_REQUEST || '1', 10);

    constructor(catalog: CatalogDocumentModel) {
        super();
        this.catalog = catalog;
        this.pattern = catalog.patternId as PatternDocumentModel;
        this.logInstance.initLogFolder('raw-data-scrape');
        this.logInstance.createFileName(`cid-${catalog._id}_`);
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
            this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.FETCH_DATA, `Start failed.`);
            this.addSummaryErrorLog(ScrapeRawDataConstantChatBotMessage.ERROR, error, this.catalog._id);
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
            const $: CheerioStatic | undefined = await this.getBody(
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
            price,
            acreage,
            address,
        }: {
            propertyType: string;
            postDate: { locator: string; delimiter: string; format: string };
            title: string;
            price: string;
            acreage: string;
            address: string;
        } = this.pattern.mainLocator;
        const propertyTypeData: string = ScrapeBase.extractData($, propertyType).shift() || '';
        const postDateData: string = ScrapeBase.extractData($, postDate.locator).shift() || '';
        const titleData: string = ScrapeBase.extractData($, title).shift() || '';
        const priceData: string = ScrapeBase.extractData($, price).shift() || '';
        const acreageData: string = ScrapeBase.extractData($, acreage).shift() || '';
        const addressData: string = ScrapeBase.extractData($, address).shift() || '';

        const othersData: {
            name: string;
            value: string;
        }[] = this.pattern.subLocator.map((subLocatorItem: { locator: string; name: string }): {
            name: string;
            value: string;
        } =>
            Object({
                name: subLocatorItem.name,
                value: ScrapeBase.extractData($, subLocatorItem.locator).shift() || '',
            })
        );

        const rawData: RawDataDocumentModel = this.handleScrapedData(
            currentDetailUrlDocument._id,
            propertyTypeData,
            postDateData,
            titleData,
            priceData,
            acreageData,
            addressData,
            othersData
        );
        currentDetailUrlDocument.isExtracted = this.EXTRACTED;
        currentDetailUrlDocument.requestRetries += 1;

        try {
            const result: (DetailUrlDocumentModel | RawDataDocumentModel)[] = await Promise.all([
                this.detailUrlLogic.update(currentDetailUrlDocument._id, currentDetailUrlDocument),
                this.rawDataLogic.create(rawData),
            ]);
            this.writeLog(ScrapeConstant.LOG_ACTION.UPDATE, `Detail URL ID: ${result[0]._id}`);
            this.writeLog(ScrapeConstant.LOG_ACTION.CREATE, `Raw data ID: ${result[1] ? result[1]._id : 'N/A'}`);
        } catch (error) {
            this.writeErrorLog(
                error,
                ScrapeConstant.LOG_ACTION.UPDATE,
                `Detail URL ID: ${currentDetailUrlDocument._id}`
            );
            this.writeErrorLog(
                error,
                ScrapeConstant.LOG_ACTION.CREATE,
                `Raw data from detail URL ID: ${currentDetailUrlDocument._id || -1}`
            );
        }
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
                this.writeLog(ScrapeConstant.LOG_ACTION.UPDATE, `Detail URL ID: ${currentDetailUrlDocument._id}`);
            } catch (error) {
                this.writeErrorLog(
                    error,
                    ScrapeConstant.LOG_ACTION.UPDATE,
                    `Detail URL ID: ${currentDetailUrlDocument._id}`
                );
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
        priceData: string,
        acreageData: string,
        addressData: string,
        othersData: { name: string; value: string }[]
    ): RawDataDocumentModel {
        let postDate: Date = DateTime.convertStringToDate(
            postDateData,
            this.pattern.mainLocator.postDate.format,
            this.pattern.mainLocator.postDate.delimiter
        );
        if (postDate.toString() === 'Invalid Date') {
            postDate = new Date(0, 0, 0, 0, 0, 0, 0);
        }
        const price: { value: string; currency: string } = {
            value: (priceData.match(ScrapeRawDataConstant.PRICE_VALUE_PATTERN) || []).shift() || '',
            currency: (priceData.match(ScrapeRawDataConstant.PRICE_CURRENCY_PATTERN) || []).shift() || '',
        };

        const acreage: { value: string; measureUnit: string } = {
            value: (acreageData.match(ScrapeRawDataConstant.ACREAGE_VALUE_PATTERN) || []).shift() || '',
            measureUnit: (acreageData.match(ScrapeRawDataConstant.ACREAGE_MEASURE_UNIT_PATTERN) || []).shift() || '',
        };

        const transactionType: number = ScrapeRawDataConstant.TRANSACTION_PATTERN.test(this.catalog.title)
            ? RawDataConstant.TYPE_OF_TRANSACTION.RENT
            : RawDataConstant.TYPE_OF_TRANSACTION.SALE;

        const propertyType: number = RawDataLogic.getInstance().getPropertyTypeIndex(propertyTypeData);

        return ({
            detailUrlId,
            transactionType,
            propertyType,
            postDate: postDate.toISOString(),
            title: titleData,
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
        this.exportLog(this.catalog, [
            { name: 'Save amount', value: this.saveAmount },
            {
                name: 'Catalog ID',
                value: this.catalog._id,
            },
            {
                name: 'Catalog title',
                value: this.catalog.title,
            },
        ]);
        await this.telegramChatBotInstance.sendMessage(
            StringHandler.replaceString(ScrapeRawDataConstantChatBotMessage.FINISH, [
                this.catalog.title,
                this.catalog.id,
            ])
        );
        this.isRunning = false;
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Scrape raw data of catalog ${this.catalog.title} (ID:${this.catalog._id}) complete.`
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