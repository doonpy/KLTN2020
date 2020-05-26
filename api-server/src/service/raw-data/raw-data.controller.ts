import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '../../common/service/common.service.controller.base';
import Validator from '../../util/validator/validator';
import Checker from '../../util/checker/checker.index';
import RawDataLogic from './raw-data.logic';
import ResponseStatusCode from '../../common/common.response-status.code';
import { RawDataApiModel, RawDataDocumentModel } from './raw-data.interface';
import DetailUrlLogic from '../detail-url/detail-url.logic';
import CommonConstant from '../../common/common.constant';

const commonPath = '/raw-dataset';
const specifyIdPath = '/raw-data/:id';
const countDocumentPath = '/count-document';

export default class RawDataController extends CommonServiceControllerBase {
    private static instance: RawDataController;

    private rawDataLogic: RawDataLogic = new RawDataLogic();

    private bodyValidator: Validator = new Validator();

    private priceValidator: Validator = new Validator();

    private acreageValidator: Validator = new Validator();

    private othersValidator: Validator = new Validator();

    private readonly PARAM_DETAIL_URL_ID: string = 'detailUrlId';

    private readonly PARAM_TRANSACTION_TYPE: string = 'transactionType';

    private readonly PARAM_PROPERTY_TYPE: string = 'propertyType';

    private readonly PARAM_POST_DATE: string = 'postDate';

    private readonly PARAM_TITLE: string = 'title';

    private readonly PARAM_DESCRIBE: string = 'describe';

    private readonly PARAM_PRICE: string = 'price';

    private readonly PARAM_PRICE_CURRENCY: string = 'currency';

    private readonly PARAM_PRICE_TIME_UNIT: string = 'timeUnit';

    private readonly PARAM_ACREAGE: string = 'acreage';

    private readonly PARAM_ACREAGE_MEASURE_UNIT: string = 'measureUnit';

    private readonly PARAM_ADDRESS: string = 'address';

    private readonly PARAM_OTHERS: string = 'others';

    private readonly PARAM_OTHERS_NAME: string = 'name';

    private readonly PARAM_VALUE: string = 'value';

    private readonly PRAM_IS_GROUPED: string = 'isGrouped';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.router
            .all(this.commonPath + countDocumentPath, [
                this.initCommonInputs.bind(this),
                this.validateCommonInputs.bind(this),
            ])
            .get(this.commonPath + countDocumentPath, this.countDocumentRoute.bind(this));
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
    protected async getAllRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.IntegerRange(1, null));

            this.validator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new Checker.IntegerRange(0, null));

            this.validator.addParamValidator(this.PARAM_PROPERTY_TYPE, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_PROPERTY_TYPE, new Checker.IntegerRange(0, null));

            this.validator.addParamValidator(this.PARAM_TITLE, new Checker.Type.String());

            this.validator.addParamValidator(this.PARAM_DESCRIBE, new Checker.Type.String());

            this.validator.addParamValidator(this.PARAM_ADDRESS, new Checker.Type.String());

            this.validator.addParamValidator(this.PRAM_IS_GROUPED, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PRAM_IS_GROUPED, new Checker.IntegerRange(0, 1));

            this.validator.validate(this.requestParams);

            const {
                documents,
                hasNext,
            }: { documents: RawDataDocumentModel[]; hasNext: boolean } = await this.rawDataLogic.getAll(
                this.limit,
                this.offset,
                this.buildQueryConditions([
                    { paramName: this.PARAM_DETAIL_URL_ID, isString: false },
                    { paramName: this.PARAM_TRANSACTION_TYPE, isString: false },
                    { paramName: this.PARAM_PROPERTY_TYPE, isString: false },
                    { paramName: this.PARAM_TITLE, isString: true },
                    { paramName: this.PARAM_DESCRIBE, isString: true },
                    { paramName: this.PARAM_ADDRESS, isString: true },
                    { paramName: this.PRAM_IS_GROUPED, isString: false },
                ]),
                this.populate
            );
            const rawDataList: object[] = documents.map(
                (rawDataItem: RawDataDocumentModel): RawDataApiModel =>
                    this.rawDataLogic.convertToApiResponse(rawDataItem)
            );
            const responseBody: object = {
                rawDataset: rawDataList,
                hasNext,
            };

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
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
    protected async getWithIdRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            await this.rawDataLogic.checkExistsWithId(idBody);
            const rawData: RawDataDocumentModel = await this.rawDataLogic.getById(idBody, true);
            const responseBody: object = {
                rawData: this.rawDataLogic.convertToApiResponse(rawData),
            };

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
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
    protected async createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.bodyValidator = new Validator();
            this.priceValidator = new Validator();
            this.acreageValidator = new Validator();
            this.othersValidator = new Validator();

            // Validate request body
            this.bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.Type.Integer());
            this.bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.IntegerRange(1, null));

            this.bodyValidator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new Checker.Type.Integer());
            this.bodyValidator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.IntegerRange(1, Object.keys(CommonConstant.TRANSACTION_TYPE).length)
            );

            this.bodyValidator.addParamValidator(this.PARAM_PROPERTY_TYPE, new Checker.Type.Integer());
            this.bodyValidator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.IntegerRange(1, Object.keys(CommonConstant.PROPERTY_TYPE).length)
            );

            this.bodyValidator.addParamValidator(this.PARAM_POST_DATE, new Checker.Type.String());
            this.bodyValidator.addParamValidator(this.PARAM_POST_DATE, new Checker.StringLength(1, null));

            this.bodyValidator.addParamValidator(this.PARAM_TITLE, new Checker.Type.String());
            this.bodyValidator.addParamValidator(this.PARAM_TITLE, new Checker.StringLength(1, null));

            this.bodyValidator.addParamValidator(this.PARAM_DESCRIBE, new Checker.Type.String());
            this.bodyValidator.addParamValidator(this.PARAM_DESCRIBE, new Checker.StringLength(1, null));

            this.bodyValidator.addParamValidator(this.PARAM_PRICE, new Checker.Type.Object());

            this.bodyValidator.addParamValidator(this.PARAM_ACREAGE, new Checker.Type.Object());

            this.bodyValidator.addParamValidator(this.PARAM_ADDRESS, new Checker.Type.String());
            this.bodyValidator.addParamValidator(this.PARAM_ADDRESS, new Checker.StringLength(1, null));

            this.bodyValidator.addParamValidator(this.PARAM_OTHERS, new Checker.Type.Object());

            // Validate price object
            this.priceValidator.addParamValidator(this.PARAM_PRICE_CURRENCY, new Checker.Type.String());

            this.priceValidator.addParamValidator(this.PARAM_PRICE_TIME_UNIT, new Checker.Type.Integer());
            this.priceValidator.addParamValidator(this.PARAM_PRICE_TIME_UNIT, new Checker.IntegerRange(0, 2));

            this.priceValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.Decimal());
            this.priceValidator.addParamValidator(this.PARAM_VALUE, new Checker.DecimalRange(0, null));

            // Validate acreage object
            this.acreageValidator.addParamValidator(this.PARAM_ACREAGE_MEASURE_UNIT, new Checker.Type.String());
            this.acreageValidator.addParamValidator(this.PARAM_ACREAGE_MEASURE_UNIT, new Checker.MeasureUnit('m²'));

            this.acreageValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.Decimal());
            this.acreageValidator.addParamValidator(this.PARAM_VALUE, new Checker.DecimalRange(0, null));

            // Validate others object
            this.othersValidator.addParamValidator(this.PARAM_OTHERS_NAME, new Checker.Type.String());

            this.othersValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.String());

            this.bodyValidator.validate(this.requestBody);
            this.priceValidator.validate((this.requestBody[this.PARAM_PRICE] as object) ?? {});
            this.acreageValidator.validate((this.requestBody[this.PARAM_ACREAGE] as object) ?? {});
            this.othersValidator.validate((this.requestBody[this.PARAM_OTHERS] as object) ?? {});

            const rawDataBody: RawDataDocumentModel = (this.requestBody as unknown) as RawDataDocumentModel;
            await DetailUrlLogic.getInstance().checkExistsWithId(rawDataBody.detailUrlId);
            await this.rawDataLogic.checkExistsWithDetailUrlId(rawDataBody.detailUrlId, true);
            const createdRawData: RawDataDocumentModel = await this.rawDataLogic.create(rawDataBody, true);

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.CREATED,
                this.rawDataLogic.convertToApiResponse(createdRawData),
                res
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
    protected async updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.bodyValidator = new Validator();
            this.priceValidator = new Validator();
            this.acreageValidator = new Validator();
            this.othersValidator = new Validator();

            // Validate request body
            this.bodyValidator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.bodyValidator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.Type.Integer());
            this.bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.IntegerRange(1, null));

            this.bodyValidator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new Checker.Type.Integer());
            this.bodyValidator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.IntegerRange(1, Object.keys(CommonConstant.PROPERTY_TYPE).length)
            );

            this.bodyValidator.addParamValidator(this.PARAM_PROPERTY_TYPE, new Checker.Type.Integer());
            this.bodyValidator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.IntegerRange(1, Object.keys(CommonConstant.PROPERTY_TYPE).length)
            );

            this.bodyValidator.addParamValidator(this.PARAM_POST_DATE, new Checker.Type.String());
            this.bodyValidator.addParamValidator(this.PARAM_POST_DATE, new Checker.StringLength(1, null));

            this.bodyValidator.addParamValidator(this.PARAM_TITLE, new Checker.Type.String());
            this.bodyValidator.addParamValidator(this.PARAM_TITLE, new Checker.StringLength(1, null));

            this.bodyValidator.addParamValidator(this.PARAM_DESCRIBE, new Checker.Type.String());
            this.bodyValidator.addParamValidator(this.PARAM_DESCRIBE, new Checker.StringLength(1, null));

            this.bodyValidator.addParamValidator(this.PARAM_PRICE, new Checker.Type.Object());

            this.bodyValidator.addParamValidator(this.PARAM_ACREAGE, new Checker.Type.Object());

            this.bodyValidator.addParamValidator(this.PARAM_ADDRESS, new Checker.Type.String());
            this.bodyValidator.addParamValidator(this.PARAM_ADDRESS, new Checker.StringLength(1, null));

            this.bodyValidator.addParamValidator(this.PARAM_OTHERS, new Checker.Type.Object());

            // Validate price object
            this.priceValidator.addParamValidator(this.PARAM_PRICE_CURRENCY, new Checker.Type.String());

            this.priceValidator.addParamValidator(this.PARAM_PRICE_TIME_UNIT, new Checker.Type.Integer());
            this.priceValidator.addParamValidator(this.PARAM_PRICE_TIME_UNIT, new Checker.IntegerRange(0, 2));

            this.priceValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.Decimal());
            this.priceValidator.addParamValidator(this.PARAM_VALUE, new Checker.DecimalRange(0, null));

            // Validate acreage object
            this.acreageValidator.addParamValidator(this.PARAM_ACREAGE_MEASURE_UNIT, new Checker.Type.String());
            this.acreageValidator.addParamValidator(this.PARAM_ACREAGE_MEASURE_UNIT, new Checker.MeasureUnit('m²'));

            this.acreageValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.Decimal());
            this.acreageValidator.addParamValidator(this.PARAM_VALUE, new Checker.DecimalRange(0, null));

            // Validate others object
            this.othersValidator.addParamValidator(this.PARAM_OTHERS_NAME, new Checker.Type.String());

            this.othersValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.String());

            this.bodyValidator.validate(this.requestBody);
            this.priceValidator.validate((this.requestBody[this.PARAM_PRICE] as object) ?? {});
            this.acreageValidator.validate((this.requestBody[this.PARAM_ACREAGE] as object) ?? {});
            this.othersValidator.validate((this.requestBody[this.PARAM_OTHERS] as object) ?? {});

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const rawDataBody: RawDataDocumentModel = (this.requestBody as unknown) as RawDataDocumentModel;
            const currentRawData: RawDataDocumentModel = await this.rawDataLogic.getById(idBody);
            await this.rawDataLogic.checkExistsWithId(idBody);
            await DetailUrlLogic.getInstance().checkExistsWithId(idBody);
            if (currentRawData.detailUrlId !== rawDataBody.detailUrlId) {
                await this.rawDataLogic.checkExistsWithDetailUrlId(rawDataBody.detailUrlId, true);
            }
            const editedRawData: RawDataDocumentModel = await this.rawDataLogic.update(idBody, rawDataBody, true);

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                this.rawDataLogic.convertToApiResponse(editedRawData),
                res
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
    protected async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            await this.rawDataLogic.checkExistsWithId(idBody);
            await this.rawDataLogic.delete(idBody);

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.NO_CONTENT, {}, res);
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
    private async countDocumentRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new Checker.IntegerRange(0, null));

            this.validator.addParamValidator(this.PARAM_PROPERTY_TYPE, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_PROPERTY_TYPE, new Checker.IntegerRange(0, null));

            this.validator.validate(this.requestQuery);

            const documentAmount: number = await this.rawDataLogic.countDocumentsWithConditions(
                this.buildQueryConditions([
                    { paramName: this.PARAM_TRANSACTION_TYPE, isString: false },
                    { paramName: this.PARAM_PROPERTY_TYPE, isString: false },
                ])
            );

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.OK, { documentAmount }, res);
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
