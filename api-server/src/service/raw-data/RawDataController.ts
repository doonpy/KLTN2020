import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '@common/service/CommonServiceControllerBase';
import Validator from '@util/validator/Validator';
import Checker from '@util/checker';
import ResponseStatusCode from '@common/response-status-code';
import CommonConstant from '@common/constant';
import RawDataLogic from './RawDataLogic';
import { RawDataDocumentModel } from './interface';
import DetailUrlLogic from '../detail-url/DetailUrlLogic';

const commonPath = '/raw-dataset';
const specifyIdPath = '/raw-data/:id';

export default class RawDataController extends CommonServiceControllerBase {
    private static instance: RawDataController;

    private rawDataLogic = new RawDataLogic();

    private bodyValidator = new Validator();

    private priceValidator = new Validator();

    private acreageValidator = new Validator();

    private othersValidator = new Validator();

    private readonly PARAM_DETAIL_URL_ID = 'detailUrlId';

    private readonly PARAM_TRANSACTION_TYPE = 'transactionType';

    private readonly PARAM_PROPERTY_TYPE = 'propertyType';

    private readonly PARAM_POST_DATE = 'postDate';

    private readonly PARAM_TITLE = 'title';

    private readonly PARAM_DESCRIBE = 'describe';

    private readonly PARAM_PRICE = 'price';

    private readonly PARAM_PRICE_CURRENCY = 'currency';

    private readonly PARAM_PRICE_TIME_UNIT = 'timeUnit';

    private readonly PARAM_ACREAGE = 'acreage';

    private readonly PARAM_ACREAGE_MEASURE_UNIT = 'measureUnit';

    private readonly PARAM_ADDRESS = 'address';

    private readonly PARAM_OTHERS = 'others';

    private readonly PARAM_OTHERS_NAME = 'name';

    private readonly PARAM_VALUE = 'value';

    private readonly PRAM_IS_GROUPED = 'isGrouped';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * @return {RawDataController}
     */
    public static getInstance(): RawDataController {
        if (!this.instance) {
            this.instance = new RawDataController();
        }

        return this.instance;
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getAllRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_DETAIL_URL_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_DETAIL_URL_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.IntegerRange(0, null)
            );

            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.IntegerRange(0, null)
            );

            this.validator.addParamValidator(
                this.PARAM_TITLE,
                new Checker.Type.String()
            );

            this.validator.addParamValidator(
                this.PARAM_DESCRIBE,
                new Checker.Type.String()
            );

            this.validator.addParamValidator(
                this.PARAM_ADDRESS,
                new Checker.Type.String()
            );

            this.validator.addParamValidator(
                this.PRAM_IS_GROUPED,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PRAM_IS_GROUPED,
                new Checker.IntegerRange(0, 1)
            );

            this.validator.validate(this.requestParams);

            const { documents, hasNext } = await this.rawDataLogic.getAll({
                limit: this.limit,
                offset: this.offset,
                conditions: this.buildQueryConditions([
                    { paramName: this.PARAM_DETAIL_URL_ID, isString: false },
                    { paramName: this.PARAM_TRANSACTION_TYPE, isString: false },
                    { paramName: this.PARAM_PROPERTY_TYPE, isString: false },
                    { paramName: this.PARAM_TITLE, isString: true },
                    { paramName: this.PARAM_DESCRIBE, isString: true },
                    { paramName: this.PARAM_ADDRESS, isString: true },
                    { paramName: this.PRAM_IS_GROUPED, isString: false },
                ]),
            });
            const rawDataList = documents.map(
                (rawDataItem: RawDataDocumentModel) =>
                    this.rawDataLogic.convertToApiResponse(rawDataItem)
            );
            const responseBody = {
                rawDataset: rawDataList,
                hasNext,
            };

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                responseBody
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getByIdRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const rawData = await this.rawDataLogic.getById(idBody);
            const responseBody = {
                rawData: this.rawDataLogic.convertToApiResponse(rawData),
            };

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                responseBody
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async createRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.bodyValidator = new Validator();
            this.priceValidator = new Validator();
            this.acreageValidator = new Validator();
            this.othersValidator = new Validator();

            // Validate request body
            this.bodyValidator.addParamValidator(
                this.PARAM_DETAIL_URL_ID,
                new Checker.Type.Integer()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_DETAIL_URL_ID,
                new Checker.IntegerRange(1, null)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.Type.Integer()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.IntegerRange(
                    1,
                    CommonConstant.TRANSACTION_TYPE.length
                )
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.Type.Integer()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.IntegerRange(1, CommonConstant.PROPERTY_TYPE.length)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_POST_DATE,
                new Checker.Type.String()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_POST_DATE,
                new Checker.StringLength(1, null)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_TITLE,
                new Checker.Type.String()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_TITLE,
                new Checker.StringLength(1, null)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_DESCRIBE,
                new Checker.Type.String()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_DESCRIBE,
                new Checker.StringLength(1, null)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_PRICE,
                new Checker.Type.Object()
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_ACREAGE,
                new Checker.Type.Object()
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_ADDRESS,
                new Checker.Type.String()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_ADDRESS,
                new Checker.StringLength(1, null)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_OTHERS,
                new Checker.Type.Object()
            );

            // Validate price object
            this.priceValidator.addParamValidator(
                this.PARAM_PRICE_CURRENCY,
                new Checker.Type.String()
            );

            this.priceValidator.addParamValidator(
                this.PARAM_PRICE_TIME_UNIT,
                new Checker.Type.Integer()
            );
            this.priceValidator.addParamValidator(
                this.PARAM_PRICE_TIME_UNIT,
                new Checker.IntegerRange(0, 2)
            );

            this.priceValidator.addParamValidator(
                this.PARAM_VALUE,
                new Checker.Type.Decimal()
            );
            this.priceValidator.addParamValidator(
                this.PARAM_VALUE,
                new Checker.DecimalRange(0, null)
            );

            // Validate acreage object
            this.acreageValidator.addParamValidator(
                this.PARAM_ACREAGE_MEASURE_UNIT,
                new Checker.Type.String()
            );
            this.acreageValidator.addParamValidator(
                this.PARAM_ACREAGE_MEASURE_UNIT,
                new Checker.MeasureUnit('m²')
            );

            this.acreageValidator.addParamValidator(
                this.PARAM_VALUE,
                new Checker.Type.Decimal()
            );
            this.acreageValidator.addParamValidator(
                this.PARAM_VALUE,
                new Checker.DecimalRange(0, null)
            );

            // Validate others object
            this.othersValidator.addParamValidator(
                this.PARAM_OTHERS_NAME,
                new Checker.Type.String()
            );

            this.othersValidator.addParamValidator(
                this.PARAM_VALUE,
                new Checker.Type.String()
            );

            this.bodyValidator.validate(this.requestBody);
            this.priceValidator.validate(
                (this.requestBody[this.PARAM_PRICE] as object) ?? {}
            );
            this.acreageValidator.validate(
                (this.requestBody[this.PARAM_ACREAGE] as object) ?? {}
            );
            this.othersValidator.validate(
                (this.requestBody[this.PARAM_OTHERS] as object) ?? {}
            );

            const rawDataBody = (this
                .requestBody as unknown) as RawDataDocumentModel;
            await DetailUrlLogic.getInstance().checkExisted({
                [this.PARAM_DOCUMENT_ID]: rawDataBody.detailUrlId,
            });
            const createdRawData = await this.rawDataLogic.create(
                rawDataBody,
                undefined,
                [{ [this.PARAM_DETAIL_URL_ID]: rawDataBody.detailUrlId }]
            );

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.CREATED,
                this.rawDataLogic.convertToApiResponse(createdRawData)
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async updateRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.bodyValidator = new Validator();
            this.priceValidator = new Validator();
            this.acreageValidator = new Validator();
            this.othersValidator = new Validator();

            // Validate request body
            this.bodyValidator.addParamValidator(
                this.PARAM_ID,
                new Checker.Type.Integer()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_ID,
                new Checker.IntegerRange(1, null)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_DETAIL_URL_ID,
                new Checker.Type.Integer()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_DETAIL_URL_ID,
                new Checker.IntegerRange(1, null)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.Type.Integer()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.IntegerRange(1, CommonConstant.PROPERTY_TYPE.length)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.Type.Integer()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.IntegerRange(1, CommonConstant.PROPERTY_TYPE.length)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_POST_DATE,
                new Checker.Type.String()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_POST_DATE,
                new Checker.StringLength(1, null)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_TITLE,
                new Checker.Type.String()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_TITLE,
                new Checker.StringLength(1, null)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_DESCRIBE,
                new Checker.Type.String()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_DESCRIBE,
                new Checker.StringLength(1, null)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_PRICE,
                new Checker.Type.Object()
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_ACREAGE,
                new Checker.Type.Object()
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_ADDRESS,
                new Checker.Type.String()
            );
            this.bodyValidator.addParamValidator(
                this.PARAM_ADDRESS,
                new Checker.StringLength(1, null)
            );

            this.bodyValidator.addParamValidator(
                this.PARAM_OTHERS,
                new Checker.Type.Object()
            );

            // Validate price object
            this.priceValidator.addParamValidator(
                this.PARAM_PRICE_CURRENCY,
                new Checker.Type.String()
            );

            this.priceValidator.addParamValidator(
                this.PARAM_PRICE_TIME_UNIT,
                new Checker.Type.Integer()
            );
            this.priceValidator.addParamValidator(
                this.PARAM_PRICE_TIME_UNIT,
                new Checker.IntegerRange(
                    1,
                    CommonConstant.PRICE_TIME_UNIT.length
                )
            );

            this.priceValidator.addParamValidator(
                this.PARAM_VALUE,
                new Checker.Type.Decimal()
            );
            this.priceValidator.addParamValidator(
                this.PARAM_VALUE,
                new Checker.DecimalRange(0, null)
            );

            // Validate acreage object
            this.acreageValidator.addParamValidator(
                this.PARAM_ACREAGE_MEASURE_UNIT,
                new Checker.Type.String()
            );
            this.acreageValidator.addParamValidator(
                this.PARAM_ACREAGE_MEASURE_UNIT,
                new Checker.MeasureUnit('m²')
            );

            this.acreageValidator.addParamValidator(
                this.PARAM_VALUE,
                new Checker.Type.Decimal()
            );
            this.acreageValidator.addParamValidator(
                this.PARAM_VALUE,
                new Checker.DecimalRange(0, null)
            );

            // Validate others object
            this.othersValidator.addParamValidator(
                this.PARAM_OTHERS_NAME,
                new Checker.Type.String()
            );

            this.othersValidator.addParamValidator(
                this.PARAM_VALUE,
                new Checker.Type.String()
            );

            this.bodyValidator.validate(this.requestBody);
            this.priceValidator.validate(
                (this.requestBody[this.PARAM_PRICE] as object) ?? {}
            );
            this.acreageValidator.validate(
                (this.requestBody[this.PARAM_ACREAGE] as object) ?? {}
            );
            this.othersValidator.validate(
                (this.requestBody[this.PARAM_OTHERS] as object) ?? {}
            );

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const rawDataBody = (this
                .requestBody as unknown) as RawDataDocumentModel;
            const currentRawData = await this.rawDataLogic.getById(idBody);
            await DetailUrlLogic.getInstance().checkExisted({
                [this.PARAM_DOCUMENT_ID]: idBody,
            });
            let editedRawData: RawDataDocumentModel;

            if (currentRawData.detailUrlId !== rawDataBody.detailUrlId) {
                editedRawData = await this.rawDataLogic.update(
                    idBody,
                    rawDataBody,
                    undefined,
                    [{ [this.PARAM_DETAIL_URL_ID]: rawDataBody.detailUrlId }]
                );
            } else {
                editedRawData = await this.rawDataLogic.update(
                    idBody,
                    rawDataBody
                );
            }

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                this.rawDataLogic.convertToApiResponse(editedRawData)
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async deleteRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            await this.rawDataLogic.delete(idBody);

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.NO_CONTENT,
                {}
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getDocumentAmount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.IntegerRange(
                    1,
                    CommonConstant.TRANSACTION_TYPE.length
                )
            );

            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.IntegerRange(1, CommonConstant.PROPERTY_TYPE.length)
            );

            this.validator.validate(this.requestQuery);

            const documentAmount = await this.rawDataLogic.getDocumentAmount(
                this.buildQueryConditions([
                    { paramName: this.PARAM_TRANSACTION_TYPE, isString: false },
                    { paramName: this.PARAM_PROPERTY_TYPE, isString: false },
                ])
            );

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                { schema: 'raw-data', documentAmount }
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
