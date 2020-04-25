import { NextFunction, Request, Response } from 'express';
import CatalogLogic from './catalog.logic';
import Validator from '../../util/validator/validator';
import Checker from '../../util/checker/checker.index';
import { CatalogDocumentModel } from './catalog.interface';
import ResponseStatusCode from '../../common/common.response-status.code';
import CommonServiceControllerBase from '../../common/service/common.service.controller.base';
import HostLogic from '../host/host.logic';
import PatternLogic from '../pattern/pattern.logic';

const commonPath = '/catalogs';
const specifyIdPath = '/catalogs/:id';

export default class CatalogController extends CommonServiceControllerBase {
    private static instance: CatalogController;

    private catalogLogic: CatalogLogic = CatalogLogic.getInstance();

    private readonly PARAM_PATTERN_ID: string = 'patternId';

    private readonly PARAM_TITLE: string = 'title';

    private readonly PARAM_URL: string = 'url';

    private readonly PARAM_LOCATOR: string = 'locator';

    private readonly PARAM_DETAIL_URL: string = 'detailUrl';

    private readonly PARAM_PAGE_NUMBER: string = 'pageNumber';

    private readonly PARAM_HOST_ID: string = 'hostId';

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
     */
    protected getAllRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_HOST_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_HOST_ID, new Checker.IntegerRange(1, null));

            this.validator.addParamValidator(this.PARAM_KEYWORD, new Checker.Type.String());

            this.validator.validate(this.requestQuery);

            const conditions: object = {
                $or: [
                    { title: { $regex: this.keyword || '', $options: 'i' } },
                    { url: { $regex: this.keyword || '', $options: 'i' } },
                ],
                hostId: ((this.requestQuery[this.PARAM_HOST_ID] as unknown) as number) || { $gt: 0 },
            };

            const { documents, hasNext } = await this.catalogLogic.getAll(this.limit, this.offset, conditions, true);
            const responseBody: object = {
                catalogs: documents.map((catalog: CatalogDocumentModel): object => {
                    return this.catalogLogic.convertToApiResponse(catalog);
                }),
                hasNext,
            };
            CommonServiceControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
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
    protected async getWithIdRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.validator.validate(this.requestParams);

            const idBody: number = (this.requestParams[this.PARAM_ID] as unknown) as number;
            await this.catalogLogic.checkExistsWithId(idBody);
            const catalog: CatalogDocumentModel = await this.catalogLogic.getById(idBody, true);
            const responseBody: object = {
                catalog: this.catalogLogic.convertToApiResponse(catalog),
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

            this.validator.addParamValidator(this.PARAM_TITLE, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_TITLE, new Checker.StringLength(1, 100));

            this.validator.addParamValidator(this.PARAM_URL, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_URL, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_LOCATOR, new Checker.Type.Object());

            this.validator.addParamValidator(this.PARAM_DETAIL_URL, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_PAGE_NUMBER, new Checker.Type.String());

            this.validator.addParamValidator(this.PARAM_HOST_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_HOST_ID, new Checker.IntegerRange(1, null));

            this.validator.addParamValidator(this.PARAM_PATTERN_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_PATTERN_ID, new Checker.IntegerRange(1, null));

            this.validator.validate((this.requestBody as unknown) as string);
            this.validator.validate((this.requestBody.locator as unknown) as { [key: string]: string });

            const catalogBody: CatalogDocumentModel = (this.requestBody as unknown) as CatalogDocumentModel;
            await this.catalogLogic.checkExistsWithUrl(catalogBody.url, true);
            await HostLogic.getInstance().checkExistsWithId(catalogBody.hostId);
            await PatternLogic.getInstance().checkExistsWithId(catalogBody.patternId);

            const createdCatalog: CatalogDocumentModel = await this.catalogLogic.create(catalogBody, true);

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.CREATED,
                this.catalogLogic.convertToApiResponse(createdCatalog),
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

            this.validator.addParamValidator(this.PARAM_TITLE, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_TITLE, new Checker.StringLength(1, 100));

            this.validator.addParamValidator(this.PARAM_URL, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_URL, new Checker.Url());

            this.validator.addParamValidator(this.PARAM_LOCATOR, new Checker.Type.Object());

            this.validator.addParamValidator(this.PARAM_DETAIL_URL, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_PAGE_NUMBER, new Checker.Type.String());

            this.validator.addParamValidator(this.PARAM_HOST_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_HOST_ID, new Checker.IntegerRange(1, null));

            this.validator.addParamValidator(this.PARAM_PATTERN_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_PATTERN_ID, new Checker.IntegerRange(1, null));

            this.validator.validate(this.requestParams);
            this.validator.validate((this.requestBody as unknown) as string);
            this.validator.validate((this.requestBody.locator as unknown) as { [key: string]: string });

            const idBody: number = (this.requestParams[this.PARAM_ID] as unknown) as number;
            const catalogBody: CatalogDocumentModel = (this.requestBody as unknown) as CatalogDocumentModel;
            await this.catalogLogic.checkExistsWithId(catalogBody._id);
            await this.catalogLogic.checkExistsWithUrl(catalogBody.url, true);
            await HostLogic.getInstance().checkExistsWithId(catalogBody.hostId);
            await PatternLogic.getInstance().checkExistsWithId(catalogBody.patternId);

            const editedCatalog: CatalogDocumentModel = await this.catalogLogic.update(idBody, catalogBody, true);

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                this.catalogLogic.convertToApiResponse(editedCatalog),
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

            const id: number = (this.requestParams[this.PARAM_ID] as unknown) as number;
            await this.catalogLogic.checkExistsWithId(id);
            await this.catalogLogic.delete(id);

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.NO_CONTENT, {}, res);
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
