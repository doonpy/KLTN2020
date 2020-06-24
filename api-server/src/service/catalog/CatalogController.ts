import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import {
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

const commonPath = '/catalogs';
const commonName = 'catalogs';
const specifyIdPath = '/catalog/:id';
const specifyName = 'catalog';

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
            title: Joi.string(),
            url: Joi.string(),
            hostId: Joi.number().integer().min(CommonConstant.MIN_ID),
            patternId: Joi.number().integer().min(CommonConstant.MIN_ID),
        });

        this.reqBodySchema = Joi.object<CatalogRequestBodySchema>({
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
                hostId: this.reqBody.hostId,
            });
            await PatternLogic.getInstance().checkExisted({
                patternId: this.reqBody.patternId,
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
                    hostId: this.reqBody.hostId,
                });
            }

            if (this.reqBody.patternId) {
                await PatternLogic.getInstance().checkExisted({
                    patternId: this.reqBody.patternId,
                });
            }

            req.locals!.validateNotExist = [{ url: this.reqBody.url }];
            next();
        } catch (error) {
            next(error);
        }
    }
}
