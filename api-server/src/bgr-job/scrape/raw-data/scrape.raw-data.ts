import ScrapeBase from '../scrape.base';
import PatternModelInterface from '../../../services/pattern/pattern.model.interface';
import PatternLogic from '../../../services/pattern/pattern.logic';
import RawDataLogic from '../../../services/raw-data/raw-data.logic';
import DateTime from '../../../util/datetime/datetime';
import StringHandler from '../../../util/string-handler/string-handler';
import { ScrapeRawDataConstant, ScrapeRawDataConstantChatBotMessage } from './scrape.raw-data.constant';
import { RawData } from '../../../services/raw-data/raw-data.index';
import { Catalog } from '../../../services/catalog/catalog.index';
import { DetailUrl } from '../../../services/detail-url/detail-url.index';
import { ScrapeConstant } from '../scrape.constant';
import { Pattern } from '../../../services/pattern/pattern.index';
import Timeout = NodeJS.Timeout;
import ConsoleLog from '../../../util/console/console.log';
import { ConsoleConstant } from '../../../util/console/console.constant';
import CatalogLogic from '../../../services/catalog/catalog.logic';
import DetailUrlLogic from '../../../services/detail-url/detail-url.logic';
import CatalogModelInterface from '../../../services/catalog/catalog.model.interface';
import DetailUrlModelInterface from '../../../services/detail-url/detail-url.model.interface';
import RawDataModelInterface from '../../../services/raw-data/raw-data.model.interface';

export default class ScrapeRawData extends ScrapeBase {
    private readonly catalogId: number = 0;
    private readonly catalogLogic: CatalogLogic = new Catalog.Logic();
    private readonly detailUrlLogic: DetailUrlLogic = new DetailUrl.Logic();
    private readonly rawDataLogic: RawDataLogic = new RawData.Logic();
    private readonly patternLogic: PatternLogic = new PatternLogic();
    private extractedDetailUrl: string[] = [];
    private catalog: CatalogModelInterface | any;
    private detailUrls: DetailUrlModelInterface[] = [];
    private pattern: PatternModelInterface | any;
    private saveAmount: number = 0;

    private readonly NOT_EXTRACTED: boolean = false;
    private readonly EXTRACTED: boolean = true;
    private readonly MAX_REQUEST_RETRIES: number = 3;
    private readonly MAX_REQUEST: number = parseInt(process.env.SCRAPE_RAW_DATA_MAX_REQUEST || '1', 10);

    constructor(catalogId: number) {
        super();
        this.catalogId = catalogId;
        this.logInstance.initLogFolder('raw-data-scrape');
        this.logInstance.createFileName('cid-' + catalogId + '_');
    }

    /**
     * Start raw data scraper.
     */
    public async start(): Promise<void> {
        try {
            this.startTime = process.hrtime();
            this.isRunning = true;

            await Catalog.Logic.checkCatalogExistedWithId(this.catalogId);
            this.catalog = await this.catalogLogic.getById(this.catalogId);

            await Pattern.Logic.checkPatternExistedWithId(this.catalog.patternId);
            this.pattern = await this.patternLogic.getById(this.catalog.patternId);

            await this.telegramChatBotInstance.sendMessage(
                StringHandler.replaceString(ScrapeRawDataConstantChatBotMessage.START, [
                    this.catalog.title,
                    this.catalog.id,
                ])
            );

            const queryConditions: object = {
                catalogId: this.catalogId,
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
            this.addSummaryErrorLog(ScrapeRawDataConstantChatBotMessage.ERROR, error, this.catalogId);
            await this.telegramChatBotInstance.sendMessage(
                StringHandler.replaceString(error.message, [this.catalogId, error.message, this.logInstance.getUrl()])
            );
            throw new Error(
                `Scrape raw data of catalog ${this.catalog.title} (ID:${this.catalogId}) failed.\nError: ${error.message}`
            );
        }
    }

    /**
     * Scrape action
     */
    private scrapeAction(): void {
        let $: CheerioStatic | undefined;
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

            this.requestCounter++;
            $ = await this.getBody(this.catalog.hostId.domain, currentUrl);

            if (!$) {
                await this.handleFailedRequest(currentDetailUrlDocument);
            } else {
                await this.handleSuccessRequest($, currentDetailUrlDocument);
            }
            this.requestCounter--;
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

        const propertyTypeData: string = this.extractData($, propertyType).shift() || '';
        const postDateData: string = this.extractData($, postDate.locator).shift() || '';
        const titleData: string = this.extractData($, title).shift() || '';
        const priceData: string = this.extractData($, price).shift() || '';
        const acreageData: string = this.extractData($, acreage).shift() || '';
        const addressData: string = this.extractData($, address).shift() || '';

        const othersData: {
            name: string;
            value: string;
        }[] = this.pattern.subLocator.map((subLocatorItem: { locator: string; name: string }): {
            name: string;
            value: string;
        } =>
            Object({
                name: subLocatorItem.name,
                value: this.extractData($, subLocatorItem.locator).shift() || '',
            })
        );

        const rawData: RawDataModelInterface = this.handleScrapedData(
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

        try {
            const createdDoc: RawDataModelInterface = await this.rawDataLogic.create(rawData);
            this.writeLog(ScrapeConstant.LOG_ACTION.CREATE, `Raw data ID: ${createdDoc ? createdDoc._id : 'N/A'}`);
            this.saveAmount++;
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
        currentDetailUrlDocument.requestRetries++;
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
     * @param detailUrlId
     * @param propertyTypeData
     * @param postDateData
     * @param titleData
     * @param priceData
     * @param acreageData
     * @param addressData
     * @param othersData
     *
     * @return RawDataModelInterface
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
        this.exportLog(this.catalog, [{ name: 'Save amount', value: this.saveAmount }]);
        await this.telegramChatBotInstance.sendMessage(
            StringHandler.replaceString(ScrapeRawDataConstantChatBotMessage.FINISH, [
                this.catalog.title,
                this.catalog.id,
                this.logInstance.getUrl(),
            ])
        );
        this.isRunning = false;
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Scrape raw data of catalog ${this.catalog.title} (ID:${this.catalogId}) complete.`
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
