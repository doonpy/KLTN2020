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
import ChatBotTelegram from '../../../services/chatbot/chatBotTelegram';
import { ScrapeConstant } from '../scrape.constant';
import { Pattern } from '../../../services/pattern/pattern.index';
import Timeout = NodeJS.Timeout;

export default class ScrapeRawData extends ScrapeBase {
    private readonly catalogId: number = 0;
    private readonly catalogLogic: Catalog.Logic = new Catalog.Logic();
    private readonly detailUrlLogic: DetailUrl.Logic = new DetailUrl.Logic();
    private readonly rawDataLogic: RawData.Logic = new RawData.Logic();
    private readonly patternLogic: PatternLogic = new PatternLogic();
    private extractedDetailUrl: Array<string> = [];
    private catalog: Catalog.DocumentInterface | any;
    private detailUrls: Array<DetailUrl.DocumentInterface> = [];
    private pattern: PatternModelInterface | any;
    private saveAmount: number = 0;

    private readonly NOT_EXTRACTED: boolean = false;
    private readonly EXTRACTED: boolean = true;
    private readonly MAX_REQUEST_RETRIES: number = 3;

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

            ChatBotTelegram.sendMessage(
                StringHandler.replaceString(ScrapeRawDataConstantChatBotMessage.START, [
                    this.catalog.title,
                    this.catalog.id,
                ])
            );

            let queryConditions: object = {
                catalogId: this.catalogId,
                isExtracted: this.NOT_EXTRACTED,
                requestRetries: { $lt: this.MAX_REQUEST_RETRIES },
            };
            this.detailUrls = await this.detailUrlLogic.getAllWithConditions(queryConditions);

            if (this.detailUrls.length === 0) {
                this.finishAction();
                return;
            }

            this.scrapeAction();
        } catch (error) {
            this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.FETCH_DATA, `Start failed.`);
            this.addSummaryErrorLog(ScrapeRawDataConstantChatBotMessage.ERROR, error, this.catalogId);
            this.finishAction();
        }
    }

    /**
     * Scrape action
     */
    private scrapeAction(): void {
        let $: CheerioStatic | undefined;
        let loop: Timeout = setInterval(async (): Promise<void> => {
            if (this.detailUrls.length === 0 && this.requestLimiter === 0) {
                clearInterval(loop);
                this.finishAction();
            }

            if (this.requestLimiter > this.MAX_REQUEST) {
                return;
            }

            let currentDetailUrlDocument: DetailUrl.DocumentInterface | undefined = this.detailUrls.shift();
            if (!currentDetailUrlDocument) {
                return;
            }
            let currentUrl: string = currentDetailUrlDocument.url;
            this.extractedDetailUrl.push(currentDetailUrlDocument.url);

            this.requestLimiter++;
            $ = await this.getBody(this.catalog.hostId.domain, currentUrl);

            if (!$) {
                await this.handleFailedRequest(currentDetailUrlDocument);
            } else {
                await this.handleSuccessRequest($, currentDetailUrlDocument);
            }
            this.requestLimiter--;
        }, this.REQUEST_DELAY);
    }

    /**
     * @param $
     * @param currentDetailUrlDocument
     */
    protected async handleSuccessRequest(
        $: CheerioStatic,
        currentDetailUrlDocument: DetailUrl.DocumentInterface
    ): Promise<void> {
        let {
            propertyType,
            postDateLocator,
            title,
            price,
            acreage,
            address,
        }: {
            propertyType: string;
            postDateLocator: string;
            title: string;
            price: string;
            acreage: string;
            address: string;
        } = this.pattern.mainLocator;

        let propertyTypeData: string = this.extractData($, propertyType).shift() || '';
        let postDateData: string = this.extractData($, postDateLocator).shift() || '';
        let titleData: string = this.extractData($, title).shift() || '';
        let priceData: string = this.extractData($, price).shift() || '';
        let acreageData: string = this.extractData($, acreage).shift() || '';
        let addressData: string = this.extractData($, address).shift() || '';

        let othersData: Array<{ name: string; value: string }> = this.pattern.subLocator.map(
            (subLocatorItem: { locator: string; name: string }): { name: string; value: string } =>
                Object({
                    name: subLocatorItem.name,
                    value: this.extractData($, subLocatorItem.locator).shift() || '',
                })
        );

        let rawData: RawData.DocumentInterface = this.handleScrapedData(
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

            this.writeLog(ScrapeConstant.LOG_ACTION.UPDATE, `ID: ${currentDetailUrlDocument._id}`);
        } catch (error) {
            this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.UPDATE, JSON.stringify(currentDetailUrlDocument));
        }

        try {
            let createdDoc: RawData.DocumentInterface = await this.rawDataLogic.create(rawData);

            this.writeLog(ScrapeConstant.LOG_ACTION.CREATE, `ID: ${createdDoc ? createdDoc._id : 'N/A'}`);
            this.saveAmount++;
        } catch (error) {
            this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.CREATE, `ID: ${rawData._id | -1}`);
        }
    }

    /**
     * @param currentDetailUrlDocument
     */
    protected async handleFailedRequest(currentDetailUrlDocument: DetailUrl.DocumentInterface): Promise<void> {
        currentDetailUrlDocument.requestRetries++;
        if (currentDetailUrlDocument.requestRetries < this.MAX_REQUEST_RETRIES) {
            this.detailUrls.push(currentDetailUrlDocument);
        } else {
            try {
                await this.detailUrlLogic.update(currentDetailUrlDocument._id, currentDetailUrlDocument);
                this.writeLog(ScrapeConstant.LOG_ACTION.UPDATE, `ID: ${currentDetailUrlDocument._id}`);
            } catch (error) {
                this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.UPDATE, `ID: ${currentDetailUrlDocument._id}`);
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
        othersData: Array<{ name: string; value: string }>
    ): RawData.DocumentInterface {
        let postDate: Date = DateTime.convertStringToDate(
            postDateData,
            this.pattern.mainLocator.postDate.format,
            this.pattern.mainLocator.postDate.delimiter
        );
        if (postDate.toString() === 'Invalid Date') {
            postDate = new Date(0, 0, 0, 0, 0, 0, 0);
        }
        let price: { value: string; currency: string } = {
            value: (priceData.match(ScrapeRawDataConstant.PRICE_VALUE_PATTERN) || []).shift() || '',
            currency: (priceData.match(ScrapeRawDataConstant.PRICE_CURRENCY_PATTERN) || []).shift() || '',
        };

        let acreage: { value: string; measureUnit: string } = {
            value: (acreageData.match(ScrapeRawDataConstant.ACREAGE_VALUE_PATTERN) || []).shift() || '',
            measureUnit: (acreageData.match(ScrapeRawDataConstant.ACREAGE_MEASURE_UNIT_PATTERN) || []).shift() || '',
        };

        let transactionType: number = ScrapeRawDataConstant.TRANSACTION_PATTERN.test(this.catalog.title)
            ? RawData.Constant.TYPE_OF_TRANSACTION.RENT
            : RawData.Constant.TYPE_OF_TRANSACTION.SALE;

        let propertyType: number = RawDataLogic.getPropertyTypeIndex(propertyTypeData);

        return this.rawDataLogic.createDocument(
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
    public finishAction(): void {
        this.exportLog(this.catalog, [{ name: 'Save amount', value: this.saveAmount }]);
        ChatBotTelegram.sendMessage(
            StringHandler.replaceString(ScrapeRawDataConstantChatBotMessage.FINISH, [
                this.catalog.title,
                this.catalog.id,
                this.logInstance.getUrl(),
            ])
        );
        this.isRunning = false;
    }

    /**
     * Get page number scraped
     */
    public getTargetList(): Array<string> {
        return this.extractedDetailUrl;
    }
}
