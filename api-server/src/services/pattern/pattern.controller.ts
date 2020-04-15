import ControllerBase from '../controller.base';
import PatternLogic from './pattern.logic';
import { Request, Response } from 'express';
import Validator from '../../util/validator/validator';
import { Checker } from '../../util/checker/checker.index';
import PatternModelInterface from './pattern.model.interface';
import { ResponseStatusCode } from '../../common/common.response-status.code';

const commonPath: string = '/patterns';
const specifyIdPath: string = '/patterns/:id';

export default class PatternController extends ControllerBase {
    private patternLogic: PatternLogic = new PatternLogic();
    private readonly PARAM_SOURCE_URL_ID: string = 'sourceUrl';
    private readonly PARAM_MAIN_LOCATOR: string = 'mainLocator';
    private readonly PARAM_SUB_LOCATOR: string = 'subLocator';
    private readonly PARAM_TITLE_LOCATOR: string = 'title';
    private readonly PARAM_PRICE_LOCATOR: string = 'price';
    private readonly PARAM_ACREAGE_LOCATOR: string = 'acreage';
    private readonly PARAM_ADDRESS_LOCATOR: string = 'address';
    private readonly PARAM_PROPERTY_TYPE_LOCATOR: string = 'propertyType';
    private readonly PARAM_POST_DATE_LOCATOR: string = 'postDate';
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

        validator.addParamValidator(this.PARAM_SOURCE_URL_ID, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_SOURCE_URL_ID, new Checker.Url());

        validator.addParamValidator(this.PARAM_MAIN_LOCATOR, new Checker.Type.Object());

        validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_PROPERTY_TYPE_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_PROPERTY_TYPE_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_POST_DATE_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_POST_DATE_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_SUB_LOCATOR, new Checker.Type.Object());

        validator.addParamValidator(this.PARAM_LOCATOR_SUB_LOCATOR, new Checker.Type.String());

        validator.addParamValidator(this.PARAM_NAME_SUB_LOCATOR, new Checker.Type.String());

        validator.validate(this.requestBody);

        this.patternLogic
            .create(this.requestBody)
            .then((createdPattern: PatternModelInterface): void => {
                this.sendResponse(ResponseStatusCode.CREATED, PatternLogic.convertToResponse(createdPattern), res);
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

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.patternLogic
            .delete(this.requestParams[this.PARAM_ID])
            .then((): void => {
                this.sendResponse(ResponseStatusCode.NO_CONTENT, {}, res);
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

        validator.addParamValidator(this.PARAM_LIMIT, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_LIMIT, new Checker.IntegerRange(1, 1000));

        validator.addParamValidator(this.PARAM_OFFSET, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_OFFSET, new Checker.IntegerRange(0, null));

        this.patternLogic
            .getAll(this.limit, this.offset)
            .then(({ patterns, hasNext }): void => {
                const patternList: object[] = patterns.map((pattern: PatternModelInterface): object => {
                    return PatternLogic.convertToResponse(pattern);
                });

                const responseBody: object = {
                    patterns: patternList,
                    hasNext,
                };

                this.sendResponse(ResponseStatusCode.OK, responseBody, res);
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

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.patternLogic
            .getById(this.requestParams[this.PARAM_ID])
            .then((pattern: PatternModelInterface | null): void => {
                let responseBody: object = {};
                if (pattern) {
                    responseBody = {
                        pattern: PatternLogic.convertToResponse(pattern),
                    };
                }

                this.sendResponse(ResponseStatusCode.OK, responseBody, res);
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

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.addParamValidator(this.PARAM_SOURCE_URL_ID, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_SOURCE_URL_ID, new Checker.Url());

        validator.addParamValidator(this.PARAM_MAIN_LOCATOR, new Checker.Type.Object());

        validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_PROPERTY_TYPE_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_PROPERTY_TYPE_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_POST_DATE_LOCATOR, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_POST_DATE_LOCATOR, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_SUB_LOCATOR, new Checker.Type.Object());

        validator.addParamValidator(this.PARAM_LOCATOR_SUB_LOCATOR, new Checker.Type.String());

        validator.addParamValidator(this.PARAM_NAME_SUB_LOCATOR, new Checker.Type.String());

        validator.validate(this.requestParams);
        validator.validate(this.requestBody);

        this.patternLogic
            .update(this.requestParams[this.PARAM_ID], this.requestBody)
            .then((editedPattern: PatternModelInterface | undefined): void => {
                if (editedPattern) {
                    this.sendResponse(ResponseStatusCode.OK, PatternLogic.convertToResponse(editedPattern), res);
                }
            })
            .catch((error: Error): void => {
                next(error);
            });
    }
}
