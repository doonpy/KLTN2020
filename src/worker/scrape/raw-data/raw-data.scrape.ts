import ScrapeBase from '../scrape.base';
import CatalogLogic from '../../../modules/catalog/catalog.logic';
import DetailUrlLogic from '../../../modules/detail-url/detail-url.logic';
import CatalogModelInterface from '../../../modules/catalog/catalog.model.interface';
import DetailUrlModelInterface from '../../../modules/detail-url/detail-url.model.interface';
import { replaceString } from '../../../util/replace-message';
import { RawDataScrapeMessage } from './raw-data.scrape.message';
import Timeout = NodeJS.Timeout;
import PatternModelInterface from '../../../modules/pattern/pattern.model.interface';
import PatternLogic from '../../../modules/pattern/pattern.logic';
import RawDataModelInterface from '../../../modules/raw-data/raw-data.model.interface';
import RawDataModel from '../../../modules/raw-data/raw-data.model';
import { RawDataConstant } from '../../../modules/raw-data/raw-data.constant';
import RawDataLogic from '../../../modules/raw-data/raw-data.logic';

const PRICE_VALUE_PATTERN: RegExp = new RegExp(
    /(([1-9]+)?0?\.?[0-9]+)|((t|T)hỏa (T|t)huận)|((N|n)egotiated)/
);
const PRICE_CURRENCY_PATTERN: RegExp = new RegExp(
    /(million)|(billion)|(billion vnd\/month)|(million vnd\/month)|(triệu)|(tỷ)|(nghìn\/tháng)|(triệu\/tháng)|(tỷ\/tháng)/
);
const ACREAGE_VALUE_PATTERN: RegExp = new RegExp(/(([1-9]+)?0?\.?[0-9]+)/);
const ACREAGE_MEASURE_UNIT_PATTERN: RegExp = new RegExp(/m²|km²/);
const ADDRESS_INDEX: {
    CITY: number;
    DISTRICT: number;
    WARD: number;
    STREET: number;
    PROJECT: number;
} = {
    CITY: 4,
    DISTRICT: 3,
    WARD: 2,
    STREET: 1,
    PROJECT: 0,
};
const TRANSACTION_PATTERN: RegExp = new RegExp(/(t|T)huê|(r|R)ent/);
const UNDEFINED_VALUE: number = -1;

class RawDataScrape extends ScrapeBase {
    private readonly catalogId: number = 0;
    private readonly catalogLogic: CatalogLogic = new CatalogLogic();
    private readonly detailUrlLogic: DetailUrlLogic = new DetailUrlLogic();
    private readonly patternLogic: PatternLogic = new PatternLogic();
    private catalog: CatalogModelInterface | any;
    private detailUrls: Array<DetailUrlModelInterface> = [];
    private pattern: PatternModelInterface | any;

    private readonly NOT_EXTRACTED: boolean = false;
    private readonly EXTRACTED: boolean = true;
    private readonly MAX_REQUEST_RETRIES: number = 3;

    constructor(catalogId: number) {
        super();
        this.logInstance.initLogFolder('raw-data-scrape', 'txt');
        this.catalogId = catalogId;
    }

    /**
     * Start raw data scraper.
     */
    public async start(): Promise<void> {
        try {
            this.startTime = process.hrtime();
            this.catalog = await this.catalogLogic.getById(this.catalogId);
            this.pattern = await this.patternLogic.getByCatalogId(this.catalogId);

            let queryConditions: object = {
                catalogId: this.catalogId,
                isExtracted: this.NOT_EXTRACTED,
                requestRetries: { $lt: this.MAX_REQUEST_RETRIES },
            };
            this.detailUrls = await this.detailUrlLogic.getAllWithConditions(queryConditions);

            if (this.detailUrls.length === 0) {
                this.finishAction(0);
                return;
            }

            this.telegramChatBot.sendMessage(
                replaceString(RawDataScrapeMessage.START_SCRAPE, [
                    this.catalog.title,
                    this.catalog.id,
                ])
            );

            this.scrapeAction();
            this.saveAction();
        } catch (error) {
            this.logInstance.addLine(`- ERROR: ${error.message}`);
            this.logInstance.addLine(`- CATALOG ID: ${this.catalogId}`);
            this.logInstance.exportFile();
            this.telegramChatBot.sendMessage(
                replaceString(RawDataScrapeMessage.ERROR, [
                    this.catalogId,
                    error.message,
                    this.FULL_HOST_URI + '/' + this.logInstance.getFullStaticPath(),
                ])
            );
        }
    }

    /**
     * Scrape action
     */
    private scrapeAction(): void {
        this.isScrapeDone = false;
        let detailUrlsScrapedCounter: number = 0;
        let requestCounter: number = 0;

        const scrapeLoop: Timeout = setInterval(async (): Promise<void> => {
            if (this.detailUrls.length === 0) {
                clearInterval(scrapeLoop);
                this.finishAction(detailUrlsScrapedCounter);
                return;
            }

            if (requestCounter > this.MAX_REQUEST) {
                return;
            }

            requestCounter++;

            let currentDetailUrl: DetailUrlModelInterface | undefined = this.detailUrls.shift();
            if (!currentDetailUrl || currentDetailUrl.requestRetries > this.MAX_REQUEST_RETRIES) {
                return;
            }

            let $: CheerioStatic | undefined = await this.getBody(
                this.catalog.hostId.domain + currentDetailUrl.url
            );

            if (!$) {
                currentDetailUrl.requestRetries++;
                if (currentDetailUrl.requestRetries < this.MAX_REQUEST_RETRIES) {
                    this.detailUrls.push(currentDetailUrl);
                }
                this.saveQueue.push(currentDetailUrl);
                return;
            }

            let propertyTypeData: string =
                (await this.extractData($, this.pattern.mainLocator.propertyType)).shift() || '';
            let titleData: string =
                (await this.extractData($, this.pattern.mainLocator.title)).shift() || '';
            let priceData: string =
                (await this.extractData($, this.pattern.mainLocator.price)).shift() || '';
            let acreageData: string =
                (await this.extractData($, this.pattern.mainLocator.acreage)).shift() || '';
            let addressData: string =
                (await this.extractData($, this.pattern.mainLocator.address)).shift() || '';
            let othersData: Array<object> = [];

            for (let i: number = 0; i < this.pattern.subLocator.length; i++) {
                let data: object = {
                    name: this.pattern.subLocator[i].name,
                    value:
                        (await this.extractData($, this.pattern.subLocator[i].locator)).shift() ||
                        '',
                };

                othersData.push(data);
            }

            let rawData: RawDataModelInterface = this.handleScrapedData(
                currentDetailUrl._id,
                propertyTypeData,
                titleData,
                priceData,
                acreageData,
                addressData,
                othersData
            );
            this.saveQueue.push(rawData);

            currentDetailUrl.isExtracted = this.EXTRACTED;
            this.saveQueue.push(currentDetailUrl);

            this.logInstance.addLine(`- OK: '${currentDetailUrl.url}'`);
            detailUrlsScrapedCounter++;

            requestCounter--;
        }, this.REQUEST_DELAY);
    }

    /**
     * @param detailUrlId
     * @param propertyTypeData
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
        titleData: string,
        priceData: string,
        acreageData: string,
        addressData: string,
        othersData: Array<object>
    ): RawDataModelInterface {
        let price: { value: number; currency: string } = {
            value: Number((priceData.match(PRICE_VALUE_PATTERN) || []).shift()) || UNDEFINED_VALUE,
            currency: (priceData.match(PRICE_CURRENCY_PATTERN) || []).shift() || '',
        };

        let acreage: { value: number; measureUnit: string } = {
            value:
                Number((acreageData.match(ACREAGE_VALUE_PATTERN) || []).shift()) || UNDEFINED_VALUE,
            measureUnit: (acreageData.match(ACREAGE_MEASURE_UNIT_PATTERN) || []).shift() || '',
        };

        let addressElement: Array<string> = addressData.split(/\s?\,\s?/);
        let address: {
            city: string;
            district: string;
            ward: string;
            street: string;
            project: string;
        } = {
            city:
                addressElement.length === Object.keys(ADDRESS_INDEX).length
                    ? addressElement[ADDRESS_INDEX.CITY]
                    : addressElement[ADDRESS_INDEX.CITY - 1],
            district:
                addressElement.length === Object.keys(ADDRESS_INDEX).length
                    ? addressElement[ADDRESS_INDEX.DISTRICT]
                    : addressElement[ADDRESS_INDEX.DISTRICT - 1],
            ward:
                addressElement.length === Object.keys(ADDRESS_INDEX).length
                    ? addressElement[ADDRESS_INDEX.WARD]
                    : addressElement[ADDRESS_INDEX.WARD - 1],
            street:
                addressElement.length === Object.keys(ADDRESS_INDEX).length
                    ? addressElement[ADDRESS_INDEX.STREET]
                    : addressElement[ADDRESS_INDEX.STREET - 1],
            project:
                addressElement.length === Object.keys(ADDRESS_INDEX).length
                    ? addressElement[ADDRESS_INDEX.PROJECT]
                    : '',
        };

        let transactionType: number = TRANSACTION_PATTERN.test(this.catalog.title)
            ? RawDataConstant.TYPE_OF_TRANSACTION.RENT
            : RawDataConstant.TYPE_OF_TRANSACTION.SALE;

        let propertyType: number = RawDataLogic.getPropertyTypeIndex(propertyTypeData);

        return new RawDataModel({
            detailUrlId: detailUrlId,
            transactionType: transactionType,
            propertyType: propertyType,
            title: titleData,
            price: price,
            acreage: acreage,
            address: address,
            others: othersData,
        });
    }

    /**
     * @param successRequestCounter
     */
    private addSummaryLog(successRequestCounter: number): void {
        let endTime: [number, number] = process.hrtime(this.startTime);
        this.logInstance.addLine(`-------- SUMMARY -------`);
        this.logInstance.addLine(
            replaceString(`-> EXECUTION TIME: %is %ims`, [endTime[0], endTime[1] / 1000000])
        );
        this.logInstance.addLine(`-> CATALOG: ${this.catalog.title} (ID: ${this.catalog._id})`);
        this.logInstance.addLine(`-> HOST DOMAIN: ${this.catalog.hostId.domain}`);
        this.logInstance.addLine(`-> SUCCESS REQUEST(S): ${successRequestCounter}`);
        this.logInstance.addLine(`-> FAILED REQUEST(S): ${this.failedRequestCounter}`);
    }

    /**
     * Finish action
     *
     * @param successRequestCounter
     */
    protected finishAction(successRequestCounter: number): void {
        this.isScrapeDone = true;
        this.addSummaryLog(successRequestCounter);
        this.logInstance.exportFile();
        this.telegramChatBot.sendMessage(
            replaceString(RawDataScrapeMessage.FINISH_SCRAPE, [
                this.catalog.title,
                this.catalog.id,
                this.FULL_HOST_URI + '/' + this.logInstance.getFullStaticPath(),
            ])
        );
    }
}

export default RawDataScrape;
