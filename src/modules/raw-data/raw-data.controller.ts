import ControllerBase from '../base/controller.base';
import { Request, Response } from 'express';
import Validator from '../validator/validator';
import IntegerChecker from '../checker/type/integer.checker';
import IntegerRangeChecker from '../checker/integer-range.checker';
import ObjectChecker from '../checker/type/object.checker';
import StringChecker from '../checker/type/string.checker';
import StringLengthChecker from '../checker/string-length.checker';
import { Constant } from '../../util/definition/constant';
import DecimalChecker from '../checker/type/decimal.checker';
import DecimalRangeChecker from '../checker/decimal-range.checker';
import MeasureUnitChecker from '../checker/measure-unit.checker';
import RawDataLogic from './raw-data.logic';
import { RawDataConstant } from './raw-data.constant';
import RawDataModelInterface from './raw-data.model.interface';

const commonPath: string = '/raw-dataset';
const specifyIdPath: string = '/raw-dataset/:id';

class RawDataController extends ControllerBase {
    private rawDataLogic: RawDataLogic = new RawDataLogic();
    private readonly PARAM_DETAIL_URL_ID: string = 'detailUrlId';
    private readonly PARAM_TRANSACTION_TYPE: string = 'transactionType';
    private readonly PARAM_PROPERTY_TYPE: string = 'propertyType';
    private readonly PARAM_TITLE: string = 'title';
    private readonly PARAM_PRICE: string = 'price';
    private readonly PARAM_PRICE_CURRENCY: string = 'currency';
    private readonly PARAM_ACREAGE: string = 'acreage';
    private readonly PARAM_ACREAGE_MEASURE_UNIT: string = 'measureUnit';
    private readonly PARAM_ADDRESS: string = 'address';
    private readonly PARAM_ADDRESS_CITY: string = 'city';
    private readonly PARAM_ADDRESS_DISTRICT: string = 'district';
    private readonly PARAM_ADDRESS_WARD: string = 'ward';
    private readonly PARAM_ADDRESS_STREET: string = 'street';
    private readonly PARAM_ADDRESS_PROJECT: string = 'project';
    private readonly PARAM_OTHERS: string = 'others';
    private readonly PARAM_OTHERS_NAME: string = 'name';
    private readonly PARAM_VALUE: string = 'value';

    constructor() {
        super();
        this.commonPath = commonPath;
        this.specifyIdPath = specifyIdPath;
        this.initRoutes();
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected createRoute(req: Request, res: Response, next: any): void {
        const bodyValidator = new Validator();
        const priceValidator = new Validator();
        const acreageValidator = new Validator();
        const addressValidator = new Validator();
        const othersValidator = new Validator();

        // Validate request body
        bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new IntegerChecker());
        bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new IntegerRangeChecker(1, null));

        bodyValidator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new IntegerChecker());
        bodyValidator.addParamValidator(
            this.PARAM_TRANSACTION_TYPE,
            new IntegerRangeChecker(0, Object.keys(RawDataConstant.TYPE_OF_TRANSACTION).length - 1)
        );

        bodyValidator.addParamValidator(this.PARAM_PROPERTY_TYPE, new IntegerChecker());
        bodyValidator.addParamValidator(
            this.PARAM_PROPERTY_TYPE,
            new IntegerRangeChecker(0, Object.keys(RawDataConstant.TYPE_OF_PROPERTY).length - 1)
        );

        bodyValidator.addParamValidator(this.PARAM_TITLE, new StringChecker());
        bodyValidator.addParamValidator(this.PARAM_TITLE, new StringLengthChecker(1, null));

        bodyValidator.addParamValidator(this.PARAM_PRICE, new ObjectChecker());

        bodyValidator.addParamValidator(this.PARAM_ACREAGE, new ObjectChecker());

        bodyValidator.addParamValidator(this.PARAM_ADDRESS, new ObjectChecker());

        bodyValidator.addParamValidator(this.PARAM_OTHERS, new ObjectChecker());

        // Validate price object
        priceValidator.addParamValidator(this.PARAM_PRICE_CURRENCY, new StringChecker());

        priceValidator.addParamValidator(this.PARAM_VALUE, new DecimalChecker());
        priceValidator.addParamValidator(this.PARAM_VALUE, new DecimalRangeChecker(0, null));

        // Validate acreage object
        acreageValidator.addParamValidator(this.PARAM_ACREAGE_MEASURE_UNIT, new StringChecker());
        acreageValidator.addParamValidator(
            this.PARAM_ACREAGE_MEASURE_UNIT,
            new MeasureUnitChecker('m²')
        );

        acreageValidator.addParamValidator(this.PARAM_VALUE, new DecimalChecker());
        acreageValidator.addParamValidator(this.PARAM_VALUE, new DecimalRangeChecker(0, null));

        // Validate address object
        addressValidator.addParamValidator(this.PARAM_ADDRESS_CITY, new StringChecker());

        addressValidator.addParamValidator(this.PARAM_ADDRESS_DISTRICT, new StringChecker());

        addressValidator.addParamValidator(this.PARAM_ADDRESS_WARD, new StringChecker());

        addressValidator.addParamValidator(this.PARAM_ADDRESS_STREET, new StringChecker());

        addressValidator.addParamValidator(this.PARAM_ADDRESS_PROJECT, new StringChecker());

        // Validate others object
        othersValidator.addParamValidator(this.PARAM_OTHERS_NAME, new StringChecker());

        othersValidator.addParamValidator(this.PARAM_VALUE, new StringChecker());

        bodyValidator.validate(this.requestBody);
        priceValidator.validate(this.requestBody[this.PARAM_PRICE]);
        acreageValidator.validate(this.requestBody[this.PARAM_ACREAGE]);
        addressValidator.validate(this.requestBody[this.PARAM_ADDRESS]);
        othersValidator.validate(this.requestBody[this.PARAM_OTHERS]);

        if (this.requestBody[this.PARAM_ACREAGE].measureUnit) {
            encodeURI(this.requestBody[this.PARAM_ACREAGE].measureUnit);
        }

        this.rawDataLogic
            .create(this.requestBody)
            .then((createdRawData: RawDataModelInterface): void => {
                this.sendResponse(
                    Constant.RESPONSE_STATUS_CODE.CREATED,
                    RawDataLogic.convertToResponse(createdRawData),
                    res
                );
            })
            .catch((error: Error): void => {
                next(error);
            });
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected deleteRoute(req: Request, res: Response, next: any): void {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_ID, new IntegerRangeChecker(1, null));

        validator.validate(this.requestParams);

        this.rawDataLogic
            .delete(this.requestParams[this.PARAM_ID])
            .then((): void => {
                this.sendResponse(Constant.RESPONSE_STATUS_CODE.NO_CONTENT, {}, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected getAllRoute(req: Request, res: Response, next: any): void {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_LIMIT, new IntegerChecker());
        validator.addParamValidator(this.PARAM_LIMIT, new IntegerRangeChecker(1, 1000));

        validator.addParamValidator(this.PARAM_OFFSET, new IntegerChecker());
        validator.addParamValidator(this.PARAM_OFFSET, new IntegerRangeChecker(0, null));

        validator.addParamValidator(this.PARAM_DETAIL_URL_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_DETAIL_URL_ID, new IntegerRangeChecker(1, null));

        this.rawDataLogic
            .getAll(this.limit, this.offset, this.requestQuery[this.PARAM_DETAIL_URL_ID])
            .then(({ rawDataset, hasNext }): void => {
                let rawDataList: Array<object> = rawDataset.map(
                    (rawDataItem: RawDataModelInterface): object => {
                        return RawDataLogic.convertToResponse(rawDataItem);
                    }
                );

                let responseBody: object = {
                    rawDataset: rawDataList,
                    hasNext: hasNext,
                };

                this.sendResponse(Constant.RESPONSE_STATUS_CODE.OK, responseBody, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected getWithIdRoute(req: Request, res: Response, next: any): void {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_ID, new IntegerRangeChecker(1, null));

        validator.validate(this.requestParams);

        this.rawDataLogic
            .getById(this.requestParams[this.PARAM_ID])
            .then((rawData: RawDataModelInterface | null): void => {
                let responseBody: object = {
                    rawData: RawDataLogic.convertToResponse(rawData),
                };

                this.sendResponse(Constant.RESPONSE_STATUS_CODE.OK, responseBody, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected updateRoute(req: Request, res: Response, next: any): void {
        const bodyValidator = new Validator();
        const priceValidator = new Validator();
        const acreageValidator = new Validator();
        const addressValidator = new Validator();
        const othersValidator = new Validator();

        // Validate request body
        bodyValidator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        bodyValidator.addParamValidator(this.PARAM_ID, new IntegerRangeChecker(1, null));

        bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new IntegerChecker());
        bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new IntegerRangeChecker(1, null));

        bodyValidator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new IntegerChecker());
        bodyValidator.addParamValidator(
            this.PARAM_TRANSACTION_TYPE,
            new IntegerRangeChecker(0, Object.keys(RawDataConstant.TYPE_OF_TRANSACTION).length - 1)
        );

        bodyValidator.addParamValidator(this.PARAM_PROPERTY_TYPE, new IntegerChecker());
        bodyValidator.addParamValidator(
            this.PARAM_PROPERTY_TYPE,
            new IntegerRangeChecker(0, Object.keys(RawDataConstant.TYPE_OF_PROPERTY).length - 1)
        );

        bodyValidator.addParamValidator(this.PARAM_TITLE, new StringChecker());
        bodyValidator.addParamValidator(this.PARAM_TITLE, new StringLengthChecker(1, null));

        bodyValidator.addParamValidator(this.PARAM_PRICE, new ObjectChecker());

        bodyValidator.addParamValidator(this.PARAM_ACREAGE, new ObjectChecker());

        bodyValidator.addParamValidator(this.PARAM_ADDRESS, new ObjectChecker());

        bodyValidator.addParamValidator(this.PARAM_OTHERS, new ObjectChecker());

        // Validate price object
        priceValidator.addParamValidator(this.PARAM_PRICE_CURRENCY, new StringChecker());

        priceValidator.addParamValidator(this.PARAM_VALUE, new DecimalChecker());
        priceValidator.addParamValidator(this.PARAM_VALUE, new DecimalRangeChecker(0, null));

        // Validate acreage object
        acreageValidator.addParamValidator(this.PARAM_ACREAGE_MEASURE_UNIT, new StringChecker());
        acreageValidator.addParamValidator(
            this.PARAM_ACREAGE_MEASURE_UNIT,
            new MeasureUnitChecker('m²')
        );

        acreageValidator.addParamValidator(this.PARAM_VALUE, new DecimalChecker());
        acreageValidator.addParamValidator(this.PARAM_VALUE, new DecimalRangeChecker(0, null));

        // Validate address object
        addressValidator.addParamValidator(this.PARAM_ADDRESS_CITY, new StringChecker());

        addressValidator.addParamValidator(this.PARAM_ADDRESS_DISTRICT, new StringChecker());

        addressValidator.addParamValidator(this.PARAM_ADDRESS_WARD, new StringChecker());

        addressValidator.addParamValidator(this.PARAM_ADDRESS_STREET, new StringChecker());

        addressValidator.addParamValidator(this.PARAM_ADDRESS_PROJECT, new StringChecker());

        // Validate others object
        othersValidator.addParamValidator(this.PARAM_OTHERS_NAME, new StringChecker());

        othersValidator.addParamValidator(this.PARAM_VALUE, new StringChecker());

        bodyValidator.validate(this.requestBody);
        priceValidator.validate(this.requestBody[this.PARAM_PRICE]);
        acreageValidator.validate(this.requestBody[this.PARAM_ACREAGE]);
        addressValidator.validate(this.requestBody[this.PARAM_ADDRESS]);
        othersValidator.validate(this.requestBody[this.PARAM_OTHERS]);

        if (this.requestBody[this.PARAM_ACREAGE].measureUnit) {
            encodeURI(this.requestBody[this.PARAM_ACREAGE].measureUnit);
        }

        this.rawDataLogic
            .update(this.requestParams[this.PARAM_ID], this.requestBody)
            .then((editedRawData: RawDataModelInterface | undefined): void => {
                this.sendResponse(
                    Constant.RESPONSE_STATUS_CODE.OK,
                    RawDataLogic.convertToResponse(editedRawData),
                    res
                );
            })
            .catch((error: Error): void => {
                next(error);
            });
    }
}

export default RawDataController;
