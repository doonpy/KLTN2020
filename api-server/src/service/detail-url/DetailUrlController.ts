import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '@common/service/CommonServiceControllerBase';
import Validator from '@util/validator/Validator';
import Checker from '@util/checker';
import ResponseStatusCode from '@common/response-status-code';
import DetailUrlLogic from './DetailUrlLogic';
import { DetailUrlDocumentModel } from './interface';
import CatalogLogic from '../catalog/CatalogLogic';

const commonPath = '/detail-urls';
const specifyIdPath = '/detail-url/:id';

export default class DetailUrlController extends CommonServiceControllerBase {
    private static instance: DetailUrlController;

    private detailUrlLogic = new DetailUrlLogic();

    private readonly PARAM_CATALOG_ID = 'catalogId';

    private readonly PARAM_URL = 'url';

    private readonly PARAM_IS_EXTRACTED = 'isExtracted';

    private readonly PARAM_REQUEST_RETRIES = 'requestRetries';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * @return {DetailUrlController}
     */
    public static getInstance(): DetailUrlController {
        if (!this.instance) {
            this.instance = new DetailUrlController();
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
                this.PARAM_CATALOG_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_CATALOG_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_URL,
                new Checker.Type.String()
            );

            this.validator.addParamValidator(
                this.PARAM_IS_EXTRACTED,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_IS_EXTRACTED,
                new Checker.IntegerRange(0, 1)
            );

            this.validator.addParamValidator(
                this.PARAM_REQUEST_RETRIES,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_REQUEST_RETRIES,
                new Checker.IntegerRange(0, null)
            );

            this.validator.validate(this.requestQuery);

            const { documents, hasNext } = await this.detailUrlLogic.getAll({
                limit: this.limit,
                offset: this.offset,
                conditions: this.buildQueryConditions([
                    { paramName: this.PARAM_CATALOG_ID, isString: false },
                    { paramName: this.PARAM_URL, isString: true },
                    { paramName: this.PARAM_IS_EXTRACTED, isString: false },
                    { paramName: this.PARAM_REQUEST_RETRIES, isString: false },
                ]),
            });
            const detailUrlList = documents.map((detailUrl) =>
                this.detailUrlLogic.convertToApiResponse(detailUrl)
            );

            const responseBody = {
                detailUrls: detailUrlList,
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
            const detailUrl = await this.detailUrlLogic.getById(idBody);
            const responseBody = {
                detailUrl: this.detailUrlLogic.convertToApiResponse(detailUrl),
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
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_CATALOG_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_CATALOG_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_URL,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_URL,
                new Checker.StringLength(1, null)
            );
            this.validator.addParamValidator(this.PARAM_URL, new Checker.Url());

            this.validator.validate(this.requestBody);

            const detailUrlBody = (this
                .requestBody as unknown) as DetailUrlDocumentModel;
            await CatalogLogic.getInstance().checkExisted({
                [this.PARAM_DOCUMENT_ID]: detailUrlBody.catalogId,
            });
            const createdDetailUrl = await this.detailUrlLogic.create(
                detailUrlBody,
                [],
                [{ [this.PARAM_URL]: detailUrlBody.url }]
            );

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.CREATED,
                this.detailUrlLogic.convertToApiResponse(createdDetailUrl)
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
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_CATALOG_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_CATALOG_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_URL,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_URL,
                new Checker.StringLength(1, 100)
            );

            this.validator.addParamValidator(
                this.PARAM_IS_EXTRACTED,
                new Checker.Type.Boolean()
            );

            this.validator.addParamValidator(
                this.PARAM_REQUEST_RETRIES,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_REQUEST_RETRIES,
                new Checker.IntegerRange(0, null)
            );

            this.validator.validate(this.requestParams);
            this.validator.validate(this.requestBody);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const detailUrlBody = (this
                .requestBody as unknown) as DetailUrlDocumentModel;
            await CatalogLogic.getInstance().checkExisted({
                [this.PARAM_DOCUMENT_ID]: detailUrlBody.catalogId,
            });
            const editedDetailUrl = await this.detailUrlLogic.update(
                idBody,
                detailUrlBody,
                undefined,
                [{ [this.PARAM_URL]: detailUrlBody.url }]
            );

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                this.detailUrlLogic.convertToApiResponse(editedDetailUrl)
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
            await this.detailUrlLogic.delete(idBody);

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
            const documentAmount = await this.detailUrlLogic.getDocumentAmount();

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                { schema: 'detail-url', documentAmount }
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
