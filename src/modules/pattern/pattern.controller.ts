import ControllerBase from '../base/controller.base';
import PatternLogic from './pattern.logic';
import { Request, Response } from 'express';
import Validator from '../validator/validator';
import StringChecker from '../checker/type/string.checker';
import { Constant } from '../../util/definition/constant';
import IntegerChecker from '../checker/type/integer.checker';
import IntegerRangeChecker from '../checker/integer-range.checker';
import ObjectChecker from '../checker/type/object.checker';
import StringLengthChecker from '../checker/string-length.checker';

const commonPath: string = '/patterns';
const specifyIdPath: string = '/patterns/:id';

class PatternController extends ControllerBase {
    private patternLogic: PatternLogic = new PatternLogic();
    private readonly PARAM_CATALOG_ID: string = 'catalogId';
    private readonly PARAM_SOURCE_URL_ID: string = 'sourceUrlId';
    private readonly PARAM_MAIN_LOCATOR: string = 'mainLocator';
    private readonly PARAM_SUB_LOCATOR: string = 'subLocator';
    private readonly PARAM_TITLE_LOCATOR: string = 'title';
    private readonly PARAM_PRICE_LOCATOR: string = 'price';
    private readonly PARAM_ACREAGE_LOCATOR: string = 'acreage';
    private readonly PARAM_ADDRESS_LOCATOR: string = 'address';
    private readonly PARAM_NAME_SUB_LOCATOR: string = 'name';
    private readonly PARAM_LOCATOR_SUB_LOCATOR: string = 'locator';

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
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerRangeChecker(1, null));

        validator.addParamValidator(this.PARAM_SOURCE_URL_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_SOURCE_URL_ID, new IntegerRangeChecker(1, null));

        validator.addParamValidator(this.PARAM_MAIN_LOCATOR, new ObjectChecker());

        validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new StringChecker());
        validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new StringLengthChecker(1, null));

        validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new StringChecker());
        validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new StringLengthChecker(1, null));

        validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new StringChecker());
        validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new StringLengthChecker(1, null));

        validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new StringChecker());
        validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new StringLengthChecker(1, null));

        validator.addParamValidator(this.PARAM_SUB_LOCATOR, new ObjectChecker());

        validator.addParamValidator(this.PARAM_LOCATOR_SUB_LOCATOR, new StringChecker());

        validator.addParamValidator(this.PARAM_NAME_SUB_LOCATOR, new StringChecker());

        validator.validate(this.requestBody);

        this.patternLogic
            .create(this.requestBody)
            .then((createdPattern: object): void => {
                this.sendResponse(Constant.RESPONSE_STATUS_CODE.CREATED, createdPattern, res);
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

        this.patternLogic
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

        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerRangeChecker(1, null));

        this.patternLogic
            .getAll(this.limit, this.offset, this.requestQuery[this.PARAM_CATALOG_ID])
            .then(({ patternList, hasNext }): void => {
                let responseBody: object = {
                    patterns: patternList,
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

        this.patternLogic
            .getById(this.requestParams[this.PARAM_ID])
            .then((pattern: object): void => {
                let responseBody: object = {
                    pattern: pattern,
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
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_ID, new IntegerRangeChecker(1, null));

        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerRangeChecker(1, null));

        validator.addParamValidator(this.PARAM_SOURCE_URL_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_SOURCE_URL_ID, new IntegerRangeChecker(1, null));

        validator.addParamValidator(this.PARAM_MAIN_LOCATOR, new ObjectChecker());

        validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new StringChecker());
        validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new StringLengthChecker(1, null));

        validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new StringChecker());
        validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new StringLengthChecker(1, null));

        validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new StringChecker());
        validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new StringLengthChecker(1, null));

        validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new StringChecker());
        validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new StringLengthChecker(1, null));

        validator.addParamValidator(this.PARAM_SUB_LOCATOR, new ObjectChecker());

        validator.addParamValidator(this.PARAM_LOCATOR_SUB_LOCATOR, new StringChecker());

        validator.addParamValidator(this.PARAM_NAME_SUB_LOCATOR, new StringChecker());

        validator.validate(this.requestParams);
        validator.validate(this.requestBody);

        this.patternLogic
            .update(this.requestParams[this.PARAM_ID], this.requestBody)
            .then((editedPattern: object): void => {
                this.sendResponse(Constant.RESPONSE_STATUS_CODE.OK, editedPattern, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    }
}

export default PatternController;
