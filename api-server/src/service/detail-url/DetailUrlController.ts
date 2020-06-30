import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import DetailUrlLogic from './DetailUrlLogic';
import {
    DetailUrlDocumentModel,
    DetailUrlRequestBodySchema,
    DetailUrlRequestParamSchema,
    DetailUrlRequestQuerySchema,
} from './interface';
import CatalogLogic from '../catalog/CatalogLogic';
import Joi from '@hapi/joi';
import CommonConstant from '@common/constant';
import { CommonRequest } from '@service/interface';

const commonPath = '/detail-urls';
const commonName = 'detailUrls';
const specifyIdPath = '/detail-url/:id';
const specifyName = 'detailUrl';

export default class DetailUrlController extends ServiceControllerBase<
    DetailUrlRequestParamSchema,
    DetailUrlRequestQuerySchema,
    DetailUrlRequestBodySchema
> {
    private static instance: DetailUrlController;
    private readonly PARAM_CATALOG_ID = 'catalogId';
    private readonly PARAM_URL = 'url';
    private readonly PARAM_IS_EXTRACTED = 'isExtracted';
    private readonly PARAM_REQUEST_RETRIES = 'requestRetries';

    constructor() {
        super(commonName, specifyName, DetailUrlLogic.getInstance());
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    public static getInstance(): DetailUrlController {
        if (!this.instance) {
            this.instance = new DetailUrlController();
        }

        return this.instance;
    }

    protected initValidateSchema(): void {
        this.reqQuerySchema = this.reqQuerySchema.keys({
            catalogId: Joi.number().integer().min(CommonConstant.MIN_ID),
            url: Joi.string(),
            isExtracted: Joi.number().integer().valid(0, 1),
            requestRetries: Joi.number().integer().min(0).max(3),
        });

        this.reqBodySchema = this.reqBodySchema.keys({
            catalogId: Joi.number().integer().min(CommonConstant.MIN_ID),
            url: Joi.string()
                .regex(/:\/\/[0-9a-z-.]+\.[a-z]+\/?/i)
                .uri({
                    scheme: [/https?/],
                }),
        });
    }

    protected setRequiredInputForValidateSchema(): void {
        this.reqBodySchema = this.reqBodySchema.append({
            catalogId: Joi.required(),
            url: Joi.required(),
        });
    }

    protected getAllPrepend(
        req: CommonRequest<
            DetailUrlRequestParamSchema,
            DetailUrlRequestBodySchema,
            DetailUrlRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.getConditions = this.buildQueryConditions([
            { paramName: this.PARAM_CATALOG_ID, isString: false },
            { paramName: this.PARAM_URL, isString: true },
            { paramName: this.PARAM_IS_EXTRACTED, isString: false },
            { paramName: this.PARAM_REQUEST_RETRIES, isString: false },
        ]);
        next();
    }

    protected async createPrepend(
        req: CommonRequest<
            DetailUrlRequestParamSchema,
            DetailUrlRequestBodySchema,
            DetailUrlRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            await CatalogLogic.getInstance().checkExisted({
                [this.PARAM_DOCUMENT_ID]: this.reqBody.catalogId,
            });

            req.locals!.validateNotExist = [{ url: this.reqBody }];
            next();
        } catch (error) {
            next(error);
        }
    }

    protected async updatePrepend(
        req: CommonRequest<
            DetailUrlRequestParamSchema,
            DetailUrlRequestBodySchema,
            DetailUrlRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (this.reqBody.catalogId) {
                await CatalogLogic.getInstance().checkExisted({
                    [this.PARAM_DOCUMENT_ID]: this.reqBody.catalogId,
                });
            }
            const currentDetailUrl = (await this.logicInstance.getById(
                Number(this.reqParam.id)
            )) as DetailUrlDocumentModel;
            if (currentDetailUrl && currentDetailUrl.url !== this.reqBody.url) {
                req.locals!.validateNotExist = [{ url: this.reqBody.url }];
            }
            next();
        } catch (error) {
            next(error);
        }
    }
}
