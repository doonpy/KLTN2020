import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import {
    CatalogDocumentModel,
    CatalogLocator,
    CatalogRequestBodySchema,
    CatalogRequestParamSchema,
    CatalogRequestQuerySchema,
} from './interface';
import CatalogLogic from './CatalogLogic';
import HostLogic from '../host/HostLogic';
import PatternLogic from '../pattern/PatternLogic';
import Joi from '@hapi/joi';
import CommonConstant from '@common/constant';
import { CommonRequest } from '@service/interface';
import fs from 'fs';
import { createCatalogViewFile } from '@service/catalog/helper';
import { getCryptoFilename } from '@util/file/file';
import ResponseStatusCode from '@common/response-status-code';

const commonPath = '/catalogs';
const commonName = 'catalogs';
const specifyIdPath = '/catalog/:id';
const specifyName = 'catalog';
const getCatalogViewPath = '/get-catalog-view';
const catalogReviewPath = '/catalog-review';

export default class CatalogController extends ServiceControllerBase<
    CatalogRequestParamSchema,
    CatalogRequestQuerySchema,
    CatalogRequestBodySchema
> {
    private static instance: CatalogController;
    private readonly PARAM_PATTERN_ID = 'patternId';
    private readonly PARAM_TITLE = 'title';
    private readonly PARAM_URL = 'url';
    private readonly PARAM_HOST_ID = 'hostId';

    constructor() {
        super(commonName, specifyName, CatalogLogic.getInstance());
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
        this.router.get(
            this.commonPath + getCatalogViewPath,
            this.initRequestLocalVariables.bind(this),
            this.getInputFromRequest.bind(this),
            this.validateInput.bind(this),
            this.getCatalogViewPrepend.bind(this),
            this.getCatalogView.bind(this)
        );
        this.router
            .all(
                this.commonPath + catalogReviewPath,
                this.initRequestLocalVariables.bind(this),
                this.getInputFromRequest.bind(this)
            )
            .post(
                this.commonPath + catalogReviewPath,
                this.postCatalogReviewPrepend.bind(this),
                this.postCatalogReview.bind(this),
                this.sendResponse.bind(this)
            );
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

    protected initValidateSchema(): void {
        this.reqQuerySchema = this.reqQuerySchema.keys({
            id: Joi.number().integer().min(CommonConstant.MIN_ID),
            title: Joi.string(),
            url: Joi.string(),
            hostId: Joi.number().integer().min(CommonConstant.MIN_ID),
            patternId: Joi.number().integer().min(CommonConstant.MIN_ID),
        });

        this.reqBodySchema = this.reqBodySchema.keys({
            title: Joi.string(),
            hostId: Joi.number().integer().min(CommonConstant.MIN_ID),
            patternId: Joi.number().integer().min(CommonConstant.MIN_ID),
            locator: Joi.object<CatalogLocator>({
                pageNumber: Joi.string(),
                detailUrl: Joi.string(),
            }),
            url: Joi.string()
                .regex(/:\/\/[0-9a-z-.]+\.[a-z]+\/?/i)
                .uri({
                    scheme: [/https?/],
                }),
        });
    }

    protected setRequiredInputForValidateSchema(): void {
        this.reqBodySchema = this.reqBodySchema.append({
            title: Joi.required(),
            hostId: Joi.required(),
            patternId: Joi.required(),
            locator: Joi.object<CatalogLocator>({
                pageNumber: Joi.required(),
                detailUrl: Joi.required(),
            }),
            url: Joi.required(),
        });
    }

    protected getAllPrepend(
        req: CommonRequest<
            CatalogRequestParamSchema,
            CatalogRequestBodySchema,
            CatalogRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.getConditions = this.buildQueryConditions([
            { paramName: this.PARAM_HOST_ID, isString: false },
            { paramName: this.PARAM_PATTERN_ID, isString: false },
            { paramName: this.PARAM_TITLE, isString: true },
            { paramName: this.PARAM_URL, isString: true },
        ]);
        next();
    }

    protected async createPrepend(
        req: CommonRequest<
            CatalogRequestParamSchema,
            CatalogRequestBodySchema,
            CatalogRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            await HostLogic.getInstance().checkExisted({
                _id: this.reqBody.hostId,
            });
            await PatternLogic.getInstance().checkExisted({
                _id: this.reqBody.patternId,
            });

            req.locals!.validateNotExist = [{ url: this.reqBody.url }];
            next();
        } catch (error) {
            next(error);
        }
    }

    protected async updatePrepend(
        req: CommonRequest<
            CatalogRequestParamSchema,
            CatalogRequestBodySchema,
            CatalogRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (this.reqBody.hostId) {
                await HostLogic.getInstance().checkExisted({
                    _id: this.reqBody.hostId,
                });
            }

            if (this.reqBody.patternId) {
                await PatternLogic.getInstance().checkExisted({
                    _id: this.reqBody.patternId,
                });
            }

            const currentCatalog = (await this.logicInstance.getById(
                Number(this.reqParam.id)
            )) as CatalogDocumentModel;
            if (currentCatalog && currentCatalog.url !== this.reqBody.url) {
                req.locals!.validateNotExist = [{ url: this.reqBody.url }];
            }
            next();
        } catch (error) {
            next(error);
        }
    }

    private async getCatalogViewPrepend(
        req: CommonRequest<
            CatalogRequestParamSchema,
            CatalogRequestBodySchema,
            CatalogRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            await this.logicInstance.checkExisted({
                _id: Number(this.reqQuery.id),
            });
            const catalog = await this.logicInstance.getById(
                Number(this.reqQuery.id)
            );

            if (catalog) {
                req.locals!.catalog = catalog;
            }

            next();
        } catch (error) {
            next(error);
        }
    }

    private async getCatalogView(
        req: CommonRequest<
            CatalogRequestParamSchema,
            CatalogRequestBodySchema,
            CatalogRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const catalog = req.locals!.catalog as CatalogDocumentModel;
            const reviewFolder = process.env.REVIEW_FOLDER!;
            const filename = getCryptoFilename(catalog.url);
            if (!fs.existsSync(`${reviewFolder}/${filename}`)) {
                await createCatalogViewFile(
                    catalog.url,
                    catalog.locator.detailUrl,
                    catalog.locator.pageNumber
                );
            }

            res.redirect(`${CommonConstant.REVIEW_FOLDER_PATH}/${filename}`);
        } catch (error) {
            next(error);
        }
    }

    private postCatalogReviewPrepend(
        req: CommonRequest<
            CatalogRequestParamSchema,
            CatalogRequestBodySchema,
            CatalogRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.url = this.reqBody.url;
        req.locals!.locator = this.reqBody.locator;
        next();
    }

    private async postCatalogReview(
        req: CommonRequest<
            CatalogRequestParamSchema,
            CatalogRequestBodySchema,
            CatalogRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const filename = getCryptoFilename(req.locals!.url);
            await createCatalogViewFile(
                req.locals!.url,
                req.locals!.locator.pageNumber,
                req.locals!.locator.detailUrl
            );

            req.locals!.statusCode = ResponseStatusCode.OK;
            req.locals!.responseBody = {
                filePath: `${CommonConstant.REVIEW_FOLDER_PATH}/${filename}`,
            };
            next();
        } catch (error) {
            next(error);
        }
    }
}
