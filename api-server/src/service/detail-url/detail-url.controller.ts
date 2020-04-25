import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '../../common/service/common.service.controller.base';
import Validator from '../../util/validator/validator';
import Checker from '../../util/checker/checker.index';
import DetailUrlLogic from './detail-url.logic';
import ResponseStatusCode from '../../common/common.response-status.code';
import { DetailUrlDocumentModel } from './detail-url.interface';
import CatalogLogic from '../catalog/catalog.logic';

const commonPath = '/detail-urls';
const specifyIdPath = '/detail-urls/:id';

export default class DetailUrlController extends CommonServiceControllerBase {
    private static instance: DetailUrlController;

    private detailUrlLogic: DetailUrlLogic = new DetailUrlLogic();

    private readonly PARAM_CATALOG_ID: string = 'catalogId';

    private readonly PARAM_URL: string = 'url';

    private readonly PARAM_IS_EXTRACTED: string = 'isExtracted';

    private readonly PARAM_REQUEST_RETRIES: string = 'requestRetries';

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
    protected async getAllRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.IntegerRange(1, null));

            this.validator.validate(this.requestQuery);

            const {
                documents,
                hasNext,
            }: { documents: DetailUrlDocumentModel[]; hasNext: boolean } = await this.detailUrlLogic.getAll(
                this.limit,
                this.offset,
                { [this.PARAM_CATALOG_ID]: this.requestQuery[this.PARAM_CATALOG_ID] },
                true
            );
            const detailUrlList: object[] = documents.map((detailUrl: DetailUrlDocumentModel): object => {
                return this.detailUrlLogic.convertToApiResponse(detailUrl);
            });

            const responseBody: object = {
                detailUrls: detailUrlList,
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

            const idBody: number = (this.requestParams[this.PARAM_ID] as unknown) as number;
            await this.detailUrlLogic.checkExistsWithId(idBody);
            const detailUrl: DetailUrlDocumentModel = await this.detailUrlLogic.getById(idBody, true);
            const responseBody: object = {
                detailUrl: this.detailUrlLogic.convertToApiResponse(detailUrl),
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
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.IntegerRange(1, null));

            this.validator.addParamValidator(this.PARAM_URL, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_URL, new Checker.StringLength(1, null));
            this.validator.addParamValidator(this.PARAM_URL, new Checker.Url());

            this.validator.validate(this.requestBody);

            const detailUrlBody: DetailUrlDocumentModel = (this.requestBody as unknown) as DetailUrlDocumentModel;
            await CatalogLogic.getInstance().checkExistsWithId(detailUrlBody.catalogId);
            await this.detailUrlLogic.checkExistsWithUrl(detailUrlBody.url, true);
            const createdDetailUrl: DetailUrlDocumentModel = await this.detailUrlLogic.create(detailUrlBody, true);

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.CREATED,
                this.detailUrlLogic.convertToApiResponse(createdDetailUrl),
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
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.IntegerRange(1, null));

            this.validator.addParamValidator(this.PARAM_URL, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_URL, new Checker.StringLength(1, 100));

            this.validator.addParamValidator(this.PARAM_IS_EXTRACTED, new Checker.Type.Boolean());

            this.validator.addParamValidator(this.PARAM_REQUEST_RETRIES, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_REQUEST_RETRIES, new Checker.IntegerRange(0, null));

            this.validator.validate(this.requestParams);
            this.validator.validate(this.requestBody);

            const idBody: number = (this.requestParams[this.PARAM_ID] as unknown) as number;
            const detailUrlBody: DetailUrlDocumentModel = (this.requestBody as unknown) as DetailUrlDocumentModel;
            await CatalogLogic.getInstance().checkExistsWithId(detailUrlBody.catalogId);
            await this.detailUrlLogic.checkExistsWithUrl(detailUrlBody.url, true);
            const editedDetailUrl: DetailUrlDocumentModel = await this.detailUrlLogic.update(
                idBody,
                detailUrlBody,
                true
            );

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                this.detailUrlLogic.convertToApiResponse(editedDetailUrl),
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

            const idBody: number = (this.requestParams[this.PARAM_ID] as unknown) as number;
            await this.detailUrlLogic.checkExistsWithId(idBody);
            await this.detailUrlLogic.delete(idBody);

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.NO_CONTENT, {}, res);
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
