import ScrapeBase from '../scrape.base';
import PatternModelInterface from '../../../services/pattern/pattern.model.interface';
import RawDataLogic from '../../../services/raw-data/raw-data.logic';
import DateTime from '../../../util/datetime/datetime';
import StringHandler from '../../../util/string-handler/string-handler';
import { ScrapeRawDataConstant, ScrapeRawDataConstantChatBotMessage } from './scrape.raw-data.constant';
import RawData from '../../../services/raw-data/raw-data.index';
import DetailUrl from '../../../services/detail-url/detail-url.index';
import ScrapeConstant from '../scrape.constant';
import ConsoleLog from '../../../util/console/console.log';
import ConsoleConstant from '../../../util/console/console.constant';
import DetailUrlLogic from '../../../services/detail-url/detail-url.logic';
import CatalogModelInterface from '../../../services/catalog/catalog.model.interface';
import DetailUrlModelInterface from '../../../services/detail-url/detail-url.model.interface';
import RawDataModelInterface from '../../../services/raw-data/raw-data.model.interface';
import HostModelInterface from '../../../services/host/host.model.interface';

import Timeout = NodeJS.Timeout;

export default class ScrapeRawData extends ScrapeBase {
    private readonly detailUrlLogic: DetailUrlLogic = new DetailUrl.Logic();

    private readonly rawDataLogic: RawDataLogic = new RawData.Logic();

    private extractedDetailUrl: string[] = [];

    private readonly catalog: CatalogModelInterface;

    private detailUrls: DetailUrlModelInterface[] = [];

    private pattern: PatternModelInterface;

    private saveAmount = 0;

    private readonly NOT_EXTRACTED: boolean = false;

    private readonly EXTRACTED: boolean = true;

    private readonly MAX_REQUEST_RETRIES: number = 3;

    private readonly MAX_REQUEST: number = parseInt(process.env.SCRAPE_RAW_DATA_MAX_REQUEST || '1', 10);

    constructor(catalog: CatalogModelInterface) {
        super();
        this.catalog = catalog;
        this.pattern = catalog.patternId as PatternModelInterface;
        this.logInstance.initLogFolder('raw-data-scrape');
        this.logInstance.createFileName(`cid-${catalog._id}_`);
    }

    /**
     * Start raw data scraper.
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
            this.detailUrls = (await this.detailUrlLogic.getAll(queryConditions, false)).detailUrls;

            if (this.detailUrls.length === 0) {
                this.finishAction();
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
     * Scrape action
     */
    private scrapeAction(): void {
        const loop: Timeout = setInterval(async (): Promise<void> => {
            if (this.detailUrls.length === 0 && this.requestCounter === 0) {
                clearInterval(loop);
                await this.finishAction();
            }

            if (this.requestCounter > this.MAX_REQUEST) {
                return;
            }

            const currentDetailUrlDocument: DetailUrlModelInterface | undefined = this.detailUrls.shift();
            if (!currentDetailUrlDocument) {
                return;
            }

            const currentUrl: string = currentDetailUrlDocument.url;
            this.extractedDetailUrl.push(currentDetailUrlDocument.url);

            this.requestCounter += 1;
            const $: CheerioStatic | undefined = await this.getBody(
                (this.catalog.hostId as HostModelInterface).domain,
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
     * @param $
     * @param currentDetailUrlDocument
     */
    protected async handleSuccessRequest(
        $: CheerioStatic,
        currentDetailUrlDocument: DetailUrlModelInterface
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
        const targetDetailUrl: DetailUrlModelInterface = currentDetailUrlDocument;

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

        const rawData: RawDataModelInterface = this.handleScrapedData(
            targetDetailUrl._id,
            propertyTypeData,
            postDateData,
            titleData,
            priceData,
            acreageData,
            addressData,
            othersData
        );
        targetDetailUrl.isExtracted = this.EXTRACTED;

        try {
            await this.detailUrlLogic.update(targetDetailUrl._id, targetDetailUrl);
            this.writeLog(ScrapeConstant.LOG_ACTION.UPDATE, `Detail URL ID: ${targetDetailUrl._id}`);
        } catch (error) {
            this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.UPDATE, `Detail URL ID: ${targetDetailUrl._id}`);
        }

        try {
            const createdDoc: RawDataModelInterface = await this.rawDataLogic.create(rawData);
            this.writeLog(ScrapeConstant.LOG_ACTION.CREATE, `Raw data ID: ${createdDoc ? createdDoc._id : 'N/A'}`);
            this.saveAmount += 1;
        } catch (error) {
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
    protected async handleFailedRequest(currentDetailUrlDocument: DetailUrlModelInterface): Promise<void> {
        const targetDetailUrl: DetailUrlModelInterface = currentDetailUrlDocument;
        targetDetailUrl.requestRetries += 1;
        if (targetDetailUrl.requestRetries < this.MAX_REQUEST_RETRIES) {
            this.detailUrls.push(targetDetailUrl);
        } else {
            try {
                await this.detailUrlLogic.update(targetDetailUrl._id, targetDetailUrl);
                this.writeLog(ScrapeConstant.LOG_ACTION.UPDATE, `Detail URL ID: ${targetDetailUrl._id}`);
            } catch (error) {
                this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.UPDATE, `Detail URL ID: ${targetDetailUrl._id}`);
            }
        }
    }

    /**
     *
     * @return RawDataModelInterface
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
    ): RawDataModelInterface {
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
            ? RawData.Constant.TYPE_OF_TRANSACTION.RENT
            : RawData.Constant.TYPE_OF_TRANSACTION.SALE;

        const propertyType: number = RawDataLogic.getPropertyTypeIndex(propertyTypeData);

        return RawData.Logic.createDocument(
            detailUrlId,
            transactionType,
            propertyType,
            postDate.toISOString(),
            titleData,
            price,
            acreage,
            addressData,
            othersData
        );
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
    public getCatalog(): CatalogModelInterface {
        return this.catalog;
    }
}
