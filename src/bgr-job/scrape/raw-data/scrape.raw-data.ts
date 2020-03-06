import ScrapeBase from '../scrape.base';
import Timeout = NodeJS.Timeout;
import PatternModelInterface from '../../../services/pattern/pattern.model.interface';
import PatternLogic from '../../../services/pattern/pattern.logic';
import RawDataModelInterface from '../../../services/raw-data/raw-data.model.interface';
import RawDataModel from '../../../services/raw-data/raw-data.model';
import RawDataLogic from '../../../services/raw-data/raw-data.logic';
import DateTime from '../../../util/datetime/datetime';
import StringHandler from '../../../util/string-handler/string-handler';
import {
    ScrapeRawDataConstant,
    ScrapeRawDataConstantChatBotMessage,
} from './scrape.raw-data.constant';
import { RawData } from '../../../services/raw-data/raw-data.index';
import { Catalog } from '../../../services/catalog/catalog.index';
import { DetailUrl } from '../../../services/detail-url/detail-url.index';
import { BgrQueue } from '../../queue/queue.index';
import ChatBotTelegram from '../../../services/chatbot/chatBotTelegram';
import delay from 'delay';

export default class ScrapeRawData extends ScrapeBase {
    private readonly catalogId: number = 0;
    private readonly catalogLogic: Catalog.Logic = new Catalog.Logic();
    private readonly detailUrlLogic: DetailUrl.Logic = new DetailUrl.Logic();
    private readonly patternLogic: PatternLogic = new PatternLogic();
    private catalog: Catalog.DocumentInterface | any;
    private detailUrls: Array<DetailUrl.DocumentInterface> = [];
    private pattern: PatternModelInterface | any;
    private saveQueue: BgrQueue.Save;

    private readonly NOT_EXTRACTED: boolean = false;
    private readonly EXTRACTED: boolean = true;
    private readonly MAX_REQUEST_RETRIES: number = 3;
    private SAVE_QUEUE_DELAY: number = parseInt(
        process.env.SCRAPE_RAW_DATA_SAVE_QUEUE_DELAY || '500'
    ); // ms
    private SAVE_AMOUNT: number = parseInt(process.env.SCRAPE_RAW_DATA_SAVE_QUEUE_AMOUNT || '1000'); // ms

    constructor(catalogId: number) {
        super();
        this.saveQueue = new BgrQueue.Save(this.SAVE_QUEUE_DELAY, this.SAVE_AMOUNT);
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

            await Catalog.Logic.checkCatalogExistedWithId(this.catalogId);
            await PatternLogic.checkPatternExistedWithCatalogId(this.catalogId);

            this.catalog = await this.catalogLogic.getById(this.catalogId);
            this.pattern = await this.patternLogic.getByCatalogId(this.catalogId);

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

            await this.scrapeAction();
        } catch (error) {
            this.addSummaryErrorLog(
                ScrapeRawDataConstantChatBotMessage.ERROR,
                error,
                this.catalogId
            );
        }
    }

    /**
     * Scrape action
     */
    private async scrapeAction(): Promise<void> {
        let requestLimiter: number = 0;

        while (this.detailUrls.length !== 0) {
            if (requestLimiter > this.MAX_REQUEST) {
                continue;
            }

            let currentUrlObject: any | undefined = this.detailUrls.shift();
            if (!currentUrlObject || currentUrlObject.requestRetries > this.MAX_REQUEST_RETRIES) {
                continue;
            }
            requestLimiter++;

            let $: CheerioStatic | undefined = await this.getBody(
                this.catalog.hostId.domain,
                currentUrlObject.url
            );

            if (!$) {
                this.handleFailedRequest(currentUrlObject);
            } else {
                await this.handleSuccessRequest($, currentUrlObject);
            }

            requestLimiter--;
            await delay(this.REQUEST_DELAY);
        }

        this.finishAction();
    }

    /**
     * @param $
     * @param currentUrlObject
     */
    protected async handleSuccessRequest($: CheerioStatic, currentUrlObject: any): Promise<void> {
        let propertyTypeData: string =
            this.extractData($, this.pattern.mainLocator.propertyType).shift() || '';
        let postDateData: string =
            this.extractData($, this.pattern.mainLocator.postDate.locator).shift() || '';
        let titleData: string = this.extractData($, this.pattern.mainLocator.title).shift() || '';
        let priceData: string = this.extractData($, this.pattern.mainLocator.price).shift() || '';
        let acreageData: string =
            this.extractData($, this.pattern.mainLocator.acreage).shift() || '';
        let addressData: string =
            this.extractData($, this.pattern.mainLocator.address).shift() || '';
        let othersData: Array<object> = [];

        for (let i: number = 0; i < this.pattern.subLocator.length; i++) {
            let data: object = {
                name: this.pattern.subLocator[i].name,
                value: this.extractData($, this.pattern.subLocator[i].locator).shift() || '',
            };

            othersData.push(data);
        }

        let rawData: RawDataModelInterface = this.handleScrapedData(
            currentUrlObject._id,
            propertyTypeData,
            postDateData,
            titleData,
            priceData,
            acreageData,
            addressData,
            othersData
        );
        currentUrlObject.isExtracted = this.EXTRACTED;
        await this.saveQueue.pushElement([rawData, currentUrlObject]);
    }

    /**
     * @param currentUrlObject
     */
    protected handleFailedRequest(currentUrlObject: any): void {
        currentUrlObject.requestRetries++;
        if (currentUrlObject.requestRetries < this.MAX_REQUEST_RETRIES) {
            this.detailUrls.push(currentUrlObject);
        } else {
            this.saveQueue.pushElement(currentUrlObject);
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
        othersData: Array<object>
    ): RawDataModelInterface {
        let postDate: Date = DateTime.convertStringToDate(
            postDateData,
            this.pattern.mainLocator.postDate.format,
            this.pattern.mainLocator.postDate.delimiter
        );
        if (postDate.toString() === 'Invalid Date') {
            console.log(detailUrlId);

            throw new Error('stop here');
        }
        let price: { value: string; currency: string } = {
            value: (priceData.match(ScrapeRawDataConstant.PRICE_VALUE_PATTERN) || []).shift() || '',
            currency:
                (priceData.match(ScrapeRawDataConstant.PRICE_CURRENCY_PATTERN) || []).shift() || '',
        };

        let acreage: { value: string; measureUnit: string } = {
            value:
                (acreageData.match(ScrapeRawDataConstant.ACREAGE_VALUE_PATTERN) || []).shift() ||
                '',
            measureUnit:
                (
                    acreageData.match(ScrapeRawDataConstant.ACREAGE_MEASURE_UNIT_PATTERN) || []
                ).shift() || '',
        };

        let addressElement: Array<string> = addressData.split(/\s?\,\s?/);
        let address: {
            city: string;
            district: string;
            ward: string;
            street: string;
            other: string;
        } = {
            city:
                addressElement.length === Object.keys(ScrapeRawDataConstant.ADDRESS_INDEX).length
                    ? addressElement[ScrapeRawDataConstant.ADDRESS_INDEX.CITY]
                    : addressElement[ScrapeRawDataConstant.ADDRESS_INDEX.CITY - 1],
            district:
                addressElement.length === Object.keys(ScrapeRawDataConstant.ADDRESS_INDEX).length
                    ? addressElement[ScrapeRawDataConstant.ADDRESS_INDEX.DISTRICT]
                    : addressElement[ScrapeRawDataConstant.ADDRESS_INDEX.DISTRICT - 1],
            ward:
                addressElement.length === Object.keys(ScrapeRawDataConstant.ADDRESS_INDEX).length
                    ? addressElement[ScrapeRawDataConstant.ADDRESS_INDEX.WARD]
                    : addressElement[ScrapeRawDataConstant.ADDRESS_INDEX.WARD - 1],
            street:
                addressElement.length === Object.keys(ScrapeRawDataConstant.ADDRESS_INDEX).length
                    ? addressElement[ScrapeRawDataConstant.ADDRESS_INDEX.STREET]
                    : addressElement[ScrapeRawDataConstant.ADDRESS_INDEX.STREET - 1],
            other:
                addressElement.length === Object.keys(ScrapeRawDataConstant.ADDRESS_INDEX).length
                    ? addressElement[ScrapeRawDataConstant.ADDRESS_INDEX.PROJECT]
                    : '',
        };

        let transactionType: number = ScrapeRawDataConstant.TRANSACTION_PATTERN.test(
            this.catalog.title
        )
            ? RawData.Constant.TYPE_OF_TRANSACTION.RENT
            : RawData.Constant.TYPE_OF_TRANSACTION.SALE;

        let propertyType: number = RawDataLogic.getPropertyTypeIndex(propertyTypeData);

        return new RawDataModel({
            detailUrlId: detailUrlId,
            transactionType: transactionType,
            propertyType: propertyType,
            postDate: postDate,
            title: titleData,
            price: price,
            acreage: acreage,
            address: address,
            others: othersData,
        });
    }

    /**
     * Finish action
     */
    protected finishAction(): void {
        let isDone: boolean = false;
        while (!isDone) {
            if (this.saveQueue.getRemainTask() !== 0) {
                isDone = true;
            }
            this.saveQueue.stop();
            this.exportLog(this.catalog);
            ChatBotTelegram.sendMessage(
                StringHandler.replaceString(ScrapeRawDataConstantChatBotMessage.FINISH, [
                    this.catalog.title,
                    this.catalog.id,
                    this.logInstance.getUrl(),
                ])
            );
        }
    }
}
