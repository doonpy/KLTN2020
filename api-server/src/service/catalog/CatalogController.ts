import { NextFunction, Request, Response } from 'express';
import Validator from '@util/validator/Validator';
import Checker from '@util/checker';
import ResponseStatusCode from '@common/response-status-code';
import CommonServiceControllerBase from '@service/CommonServiceControllerBase';
import { CatalogDocumentModel } from './interface';
import CatalogLogic from './CatalogLogic';
import HostLogic from '../host/HostLogic';
import PatternLogic from '../pattern/PatternLogic';

const commonPath = '/catalogs';
const specifyIdPath = '/catalog/:id';

export default class CatalogController extends CommonServiceControllerBase {
    private static instance: CatalogController;

    private catalogLogic = CatalogLogic.getInstance();

    private readonly PARAM_PATTERN_ID = 'patternId';

    private readonly PARAM_TITLE = 'title';

    private readonly PARAM_URL = 'url';

    private readonly PARAM_LOCATOR = 'locator';

    private readonly PARAM_DETAIL_URL = 'detailUrl';

    private readonly PARAM_PAGE_NUMBER = 'pageNumber';

    private readonly PARAM_HOST_ID = 'hostId';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): CatalogController {
        if (!this.instance) {
            this.instance = new CatalogController();
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
    protected getAllRoute = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_HOST_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_HOST_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_TITLE,
                new Checker.Type.String()
            );

            this.validator.addParamValidator(
                this.PARAM_URL,
                new Checker.Type.String()
            );

            this.validator.addParamValidator(
                this.PARAM_PATTERN_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_PATTERN_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.validate(this.requestQuery);

            const { documents, hasNext } = await this.catalogLogic.getAll({
                limit: this.limit,
                offset: this.offset,
                conditions: this.buildQueryConditions([
                    { paramName: this.PARAM_HOST_ID, isString: false },
                    { paramName: this.PARAM_PATTERN_ID, isString: false },
                    { paramName: this.PARAM_TITLE, isString: true },
                    { paramName: this.PARAM_URL, isString: true },
                ]),
            });
            const responseBody = {
                catalogs: documents.map((catalog) =>
                    this.catalogLogic.convertToApiResponse(catalog)
                ),
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
    };

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
            const catalog = await this.catalogLogic.getById(idBody);
            const responseBody = {
                catalog: this.catalogLogic.convertToApiResponse(catalog),
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
                this.PARAM_TITLE,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_TITLE,
                new Checker.StringLength(1, 100)
            );

            this.validator.addParamValidator(
                this.PARAM_URL,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_URL,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_LOCATOR,
                new Checker.Type.Object()
            );

            this.validator.addParamValidator(
                this.PARAM_HOST_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_HOST_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_PATTERN_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_PATTERN_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_DETAIL_URL,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_DETAIL_URL,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_PAGE_NUMBER,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_DETAIL_URL,
                new Checker.StringLength(1, null)
            );

            this.validator.validate(this.requestBody);
            this.validator.validate(
                (this.requestBody[this.PARAM_LOCATOR] as object) ?? {}
            );

            const catalogBody = (this
                .requestBody as unknown) as CatalogDocumentModel;
            await HostLogic.getInstance().checkExisted({
                [this.PARAM_DOCUMENT_ID]: catalogBody.hostId,
            });
            await PatternLogic.getInstance().checkExisted({
                [this.PARAM_DOCUMENT_ID]: catalogBody.patternId,
            });

            const createdCatalog = await this.catalogLogic.create(
                catalogBody,
                [],
                [{ [this.PARAM_URL]: catalogBody.url }]
            );

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.CREATED,
                this.catalogLogic.convertToApiResponse(createdCatalog)
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
                this.PARAM_TITLE,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_TITLE,
                new Checker.StringLength(1, 100)
            );

            this.validator.addParamValidator(
                this.PARAM_URL,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(this.PARAM_URL, new Checker.Url());

            this.validator.addParamValidator(
                this.PARAM_LOCATOR,
                new Checker.Type.Object()
            );

            this.validator.addParamValidator(
                this.PARAM_DETAIL_URL,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_DETAIL_URL,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_PAGE_NUMBER,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_DETAIL_URL,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_HOST_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_HOST_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_PATTERN_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_PATTERN_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.validate(this.requestParams);
            this.validator.validate(this.requestBody);
            this.validator.validate(
                (this.requestBody[this.PARAM_LOCATOR] as object) ?? {}
            );

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const catalogBody = (this
                .requestBody as unknown) as CatalogDocumentModel;

            if (catalogBody.hostId) {
                await HostLogic.getInstance().checkExisted({
                    [this.PARAM_DOCUMENT_ID]: catalogBody.hostId,
                });
            }

            if (catalogBody.patternId) {
                await PatternLogic.getInstance().checkExisted({
                    [this.PARAM_DOCUMENT_ID]: catalogBody.patternId,
                });
            }

            const editedCatalog = await this.catalogLogic.update(
                idBody,
                catalogBody,
                undefined,
                [{ [this.PARAM_URL]: catalogBody.url }]
            );

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                this.catalogLogic.convertToApiResponse(editedCatalog)
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
            await this.catalogLogic.delete(idBody);

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
            const documentAmount = await this.catalogLogic.getDocumentAmount();

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                { schema: 'catalog', documentAmount }
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
