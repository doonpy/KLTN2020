import { NextFunction, Request, Response, Router } from 'express';
import { Model } from 'mongoose';
import ResponseStatusCode from '@common/common.response-status.code';
import { CommonDocumentModel, CommonServiceControllerBaseInterface } from '@common/service/common.service.interface';
import ExceptionCustomize from '@util/exception/exception.customize';
import Validator from '@util/validator/validator';
import StringHandler from '@util/helper/string-handler';
import CommonLanguage from '@common/common.language';
import Checker from '@util/checker/checker.index';
import HostModel from '@service/host/host.model';
import CatalogModel from '@service/catalog/catalog.model';
import PatternModel from '@service/pattern/pattern.model';
import RawDataModel from '@service/raw-data/raw-data.model';
import DetailUrlModel from '@service/detail-url/detail-url.model';
import GroupedDataModel from '@service/grouped-data/grouped-data.model';
import CommonServiceWording from '@common/service/common.service.wording';

export default abstract class CommonServiceControllerBase implements CommonServiceControllerBaseInterface {
    protected commonPath = '/:language';

    protected specifyIdPath = '/:language';

    protected documentAmountPath = '/:language/doc-amount/:schema';

    protected limit = 100;

    protected offset = 0;

    protected language = 0;

    protected populate = false;

    private schema = '';

    protected keyword = '';

    protected hasNext = false;

    protected requestBody: { [key: string]: string | number | object } = {};

    protected requestParams: { [key: string]: string } = {};

    protected requestQuery: { [key: string]: string | string[] } = {};

    protected validator: Validator = new Validator();

    public router: Router = Router();

    protected readonly PARAM_ID: string = 'id';

    protected readonly PARAM_LIMIT: string = 'limit';

    protected readonly PARAM_OFFSET: string = 'offset';

    protected readonly PARAM_POPULATE: string = 'populate';

    protected readonly PARAM_KEYWORD: string = 'keyword';

    protected readonly PARAM_LANGUAGE: string = 'language';

    private readonly PARAM_SCHEMA: string = 'schema';

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected abstract async getAllRoute(req: Request, res: Response, next: NextFunction): Promise<void>;

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected abstract async getWithIdRoute(req: Request, res: Response, next: NextFunction): Promise<void>;

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected abstract async createRoute(req: Request, res: Response, next: NextFunction): Promise<void>;

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected abstract async updateRoute(req: Request, res: Response, next: NextFunction): Promise<void>;

    /**
     * Initialize REST API routes
     */
    protected initRoutes(): void {
        this.router
            .all(this.commonPath, [this.initCommonInputs.bind(this), this.validateCommonInputs.bind(this)])
            .get(this.commonPath, this.getAllRoute.bind(this))
            .post(this.commonPath, this.createRoute.bind(this));

        this.router
            .all(this.specifyIdPath, [this.initCommonInputs.bind(this), this.validateCommonInputs.bind(this)])
            .get(this.specifyIdPath, this.getWithIdRoute.bind(this))
            .put(this.specifyIdPath, this.updateRoute.bind(this))
            .delete(this.specifyIdPath, this.deleteRoute.bind(this));

        this.router
            .all(this.documentAmountPath, this.initCommonInputs.bind(this))
            .get(this.documentAmountPath, this.getDocumentAmount.bind(this));
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected abstract async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void>;

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    private async getDocumentAmount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_SCHEMA, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_SCHEMA, new Checker.StringLength(1));

            this.validator.addParamValidator(this.PARAM_LANGUAGE, new Checker.Language());

            this.validator.validate(this.requestParams);

            let schemaModel: Model<CommonDocumentModel> | undefined;
            switch (this.schema) {
                case 'hosts':
                    schemaModel = HostModel;
                    break;
                case 'catalogs':
                    schemaModel = CatalogModel;
                    break;
                case 'patterns':
                    schemaModel = PatternModel;
                    break;
                case 'detail-urls':
                    schemaModel = DetailUrlModel;
                    break;
                case 'raw-dataset':
                    schemaModel = RawDataModel;
                    break;
                case 'grouped-dataset':
                    schemaModel = GroupedDataModel;
                    break;
                default:
                    next();
                    return;
            }

            const documentAmount: number = await schemaModel.countDocuments();
            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                { schema: StringHandler.upperCaseFirstCharacter(this.schema), documentAmount },
                res
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param req
     * @param res
     * @param next
     *
     * @return void
     */
    protected validateCommonInputs(req: Request, res: Response, next: NextFunction): void {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_LIMIT, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_LIMIT, new Checker.IntegerRange(1, 1000));

            this.validator.addParamValidator(this.PARAM_OFFSET, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_OFFSET, new Checker.IntegerRange(0, null));

            this.validator.addParamValidator(this.PARAM_POPULATE, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_POPULATE, new Checker.IntegerRange(0, 1));

            this.validator.addParamValidator(this.PARAM_KEYWORD, new Checker.Type.String());

            this.validator.addParamValidator(this.PARAM_SCHEMA, new Checker.Type.String());

            this.validator.addParamValidator(this.PARAM_LANGUAGE, new Checker.Language());

            this.validator.validate(this.requestQuery);
            this.validator.validate(this.requestParams);
            next();
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
    protected initCommonInputs(req: Request, res: Response, next: NextFunction): void {
        try {
            this.limit = Number(req.query[this.PARAM_LIMIT]) || this.limit;
            this.offset = Number(req.query[this.PARAM_OFFSET]) || this.offset;
            this.populate = Number(req.query[this.PARAM_POPULATE]) === 1;
            this.language = CommonLanguage[req.params[this.PARAM_LANGUAGE]] ?? this.language;
            this.schema = req.params[this.PARAM_SCHEMA];
            this.keyword = (req.query[this.PARAM_KEYWORD] as string) ?? this.keyword;

            this.requestParams = req.params ?? {};
            Object.keys(this.requestParams).forEach(
                (key) => !this.requestParams[key] && delete this.requestParams[key]
            );

            this.requestQuery = (req.query as { [key: string]: string }) ?? {};
            Object.keys(this.requestQuery).forEach((key) => !this.requestQuery[key] && delete this.requestQuery[key]);

            this.requestBody = req.body ?? {};
            Object.keys(this.requestBody).forEach((key) => !this.requestBody[key] && delete this.requestBody[key]);

            next();
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {number} statusCode
     * @param {object} body
     * @param {Response} res
     */
    static sendResponse(
        statusCode: number = ResponseStatusCode.INTERNAL_SERVER_ERROR,
        body: object = {},
        res: Response
    ): void {
        if (statusCode === ResponseStatusCode.NO_CONTENT) {
            res.status(statusCode).json();
        } else {
            res.status(statusCode).json(body);
        }
    }

    /**
     * @param {object} error
     * @param {number} languageIndex
     *
     * @return {ExceptionCustomize}
     */
    protected createError(
        {
            statusCode,
            cause,
            message,
        }: {
            statusCode?: number;
            cause?: { wording: string[]; value: (string[] | number)[] } | string;
            message: { wording: string[]; value: (string[] | number)[] } | string;
        },
        languageIndex: number
    ): ExceptionCustomize {
        let finalCause = CommonServiceWording.CAUSE.CAU_CM_SER_3[languageIndex];
        let finalMessage = '';
        if (cause) {
            if (typeof cause === 'string') {
                finalCause = cause;
            } else {
                const causeValueByLanguage: (string | number)[] = cause.value.map((item): string | number => {
                    if (typeof item === 'number') {
                        return item;
                    }
                    return Array.isArray(item) ? item[languageIndex] : item;
                });
                finalCause = StringHandler.replaceString(cause.wording[languageIndex], causeValueByLanguage);
            }
        }

        if (message) {
            if (typeof message === 'string') {
                finalMessage = message;
            } else {
                const messageValueByLanguage: (string | number)[] | string = message.value.map((item):
                    | string
                    | number => {
                    if (typeof item === 'number') {
                        return item;
                    }
                    return Array.isArray(item) ? item[languageIndex] : item;
                });
                finalMessage = StringHandler.replaceString(message.wording[languageIndex], messageValueByLanguage);
            }
        }

        return new ExceptionCustomize(
            statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
            finalCause,
            finalMessage,
            [this.requestParams, this.requestQuery, this.requestBody]
        );
    }

    /**
     * @param {string[]} queryParams
     *
     * @return {object}
     */
    protected buildQueryConditions(queryParams: { paramName: string; isString: boolean }[]): object {
        const conditions: { [key: string]: any } = {};

        Object.entries(this.requestQuery).forEach(([key, value]: [string, string | string[]]): void => {
            const param: { paramName: string; isString: boolean } | undefined = queryParams.find(
                (item) => item.paramName === key
            );
            if (param) {
                if (param.isString) {
                    let pattern = '';
                    if (typeof value !== 'string') {
                        value.forEach((v): void => {
                            pattern += `(?=.*${v}.*)`;
                        });
                    } else {
                        pattern = value;
                    }
                    conditions[key] = { $regex: new RegExp(pattern, 'i') };
                } else {
                    conditions[key] = value;
                }
            }
        });

        return conditions;
    }
}
