import { NextFunction, Request, Response, Router } from 'express';
import { Model, Schema } from 'mongoose';
import ResponseStatusCode from '../common.response-status.code';
import { CommonDocumentModel, CommonServiceControllerBaseInterface } from './common.service.interface';
import ExceptionCustomize from '../../util/exception/exception.customize';
import DatabaseWording from '../../service/database/database.wording';
import Validator from '../../util/validator/validator';
import StringHandler from '../../util/string-handler/string-handler';
import CommonLanguage from '../common.language';
import Checker from '../../util/checker/checker.index';
import HostModel from '../../service/host/host.model';
import CatalogModel from '../../service/catalog/catalog.model';
import PatternModel from '../../service/pattern/pattern.model';
import RawDataModel from '../../service/raw-data/raw-data.model';
import DetailUrlModel from '../../service/detail-url/detail-url.model';
import GroupedDataModel from '../../service/grouped-data/grouped-data.model';

export default abstract class CommonServiceControllerBase implements CommonServiceControllerBaseInterface {
    protected commonPath = '/:language';

    protected specifyIdPath = '/:language';

    protected documentAmountPath = '/:language/doc-amount/:schema';

    protected limit = 100;

    protected offset = 0;

    protected language = 0;

    private schema = '';

    protected keyword = '';

    protected hasNext = false;

    protected requestBody: { [key: string]: string } = {};

    protected requestParams: { [key: string]: string } = {};

    protected requestQuery: { [key: string]: string } = {};

    protected validator: Validator = new Validator();

    public router: Router = Router();

    protected readonly PARAM_ID: string = 'id';

    protected readonly PARAM_LIMIT: string = 'limit';

    protected readonly PARAM_OFFSET: string = 'offset';

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
            .all(this.commonPath, [this.initInputs.bind(this), this.validateCommonParams.bind(this)])
            .get(this.commonPath, this.getAllRoute.bind(this))
            .post(this.commonPath, this.createRoute.bind(this));

        this.router
            .all(this.specifyIdPath, [this.initInputs.bind(this), this.validateCommonParams.bind(this)])
            .get(this.specifyIdPath, this.getWithIdRoute.bind(this))
            .put(this.specifyIdPath, this.updateRoute.bind(this))
            .delete(this.specifyIdPath, this.deleteRoute.bind(this));

        this.router
            .all(this.documentAmountPath, this.initInputs.bind(this))
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
    private validateCommonParams(req: Request, res: Response, next: NextFunction): void {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_LIMIT, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_LIMIT, new Checker.IntegerRange(1, 1000));

            this.validator.addParamValidator(this.PARAM_OFFSET, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_OFFSET, new Checker.IntegerRange(0, null));

            this.validator.addParamValidator(this.PARAM_LANGUAGE, new Checker.Language());

            this.validator.validate(this.requestQuery);
            this.validator.validate(this.requestParams);
        } catch (error) {
            next(this.createError(error, this.language));
        }
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    private initInputs(req: Request, res: Response, next: NextFunction): void {
        const limit = Number(req.query[this.PARAM_LIMIT]);
        const offset = Number(req.query[this.PARAM_OFFSET]);
        const language: string = req.params[this.PARAM_LANGUAGE];

        this.limit = limit || this.limit;
        this.offset = offset || this.offset;
        this.language = CommonLanguage[language] !== undefined ? CommonLanguage[language] : this.language;
        this.schema = req.params[this.PARAM_SCHEMA];
        this.keyword = (req.query.keyword ? decodeURI(req.query.keyword as string) : this.keyword).trim();

        this.requestParams = {};
        if (Object.keys(req.params).length > 0) {
            this.requestParams = req.params;
        }

        this.requestQuery = {};
        if (Object.keys(req.query).length > 0) {
            this.requestQuery = req.query as { [key: string]: string };
        }

        this.requestBody = {};
        if (Object.keys(req.body).length > 0) {
            this.requestBody = req.body;
        }

        next();
    }

    /**
     * @param {number} statusCode
     * @param {object} body
     * @param {Response} res
     */
    protected static sendResponse(
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
            statusCode: number;
            cause: { wording: string[]; value: (string[] | number)[] };
            message: { wording: string[]; value: (string[] | number)[] };
        },
        languageIndex: number
    ): ExceptionCustomize {
        const causeValueByLanguage: (string | number)[] = cause.value.map((item): string | number => {
            if (typeof item === 'number') {
                return item;
            }
            return Array.isArray(item) ? item[languageIndex] : item;
        });
        const messageValueByLanguage: (string | number)[] = message.value.map((item): string | number => {
            if (typeof item === 'number') {
                return item;
            }
            return Array.isArray(item) ? item[languageIndex] : item;
        });

        return new ExceptionCustomize(
            statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
            StringHandler.replaceString(message.wording[languageIndex], messageValueByLanguage),
            StringHandler.replaceString(cause.wording[languageIndex], causeValueByLanguage) ||
                DatabaseWording.CAUSE.C_2[languageIndex],
            [this.requestParams, this.requestQuery, this.requestBody]
        );
    }
}
