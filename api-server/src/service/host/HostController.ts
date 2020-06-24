import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import HostLogic from './HostLogic';
import {
    HostRequestBodySchema,
    HostRequestParamSchema,
    HostRequestQuerySchema,
} from './interface';
import Joi from '@hapi/joi';
import { CommonRequest } from '@service/interface';

const commonPath = '/hosts';
const commonName = 'hosts';
const specifyIdPath = '/host/:id';
const specifyName = 'host';

export default class HostController extends ServiceControllerBase<
    HostRequestParamSchema,
    HostRequestQuerySchema,
    HostRequestBodySchema
> {
    private static instance: HostController;
    private readonly PARAM_NAME = 'name';
    private readonly PARAM_DOMAIN = 'domain';

    constructor() {
        super(commonName, specifyName, HostLogic.getInstance());
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    public static getInstance(): HostController {
        if (!this.instance) {
            this.instance = new HostController();
        }

        return this.instance;
    }

    protected initValidateSchema(): void {
        this.reqQuerySchema = this.reqQuerySchema.keys({
            name: Joi.string(),
            domain: Joi.string(),
        });

        this.reqBodySchema = Joi.object<HostRequestBodySchema>({
            name: Joi.string(),
            domain: Joi.string()
                .regex(/:\/\/[0-9a-z-.]+\.[a-z]+\/?/i)
                .uri({
                    scheme: [/https?/],
                }),
        });
    }

    protected setRequiredInputForValidateSchema(): void {
        this.reqBodySchema = this.reqBodySchema.append({
            name: Joi.required(),
            domain: Joi.required(),
        });
    }

    protected getAllPrepend(
        req: CommonRequest<
            HostRequestParamSchema,
            HostRequestBodySchema,
            HostRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.getConditions = this.buildQueryConditions([
            { paramName: this.PARAM_DOMAIN, isString: true },
            { paramName: this.PARAM_NAME, isString: true },
        ]);
        next();
    }

    protected createPrepend(
        req: CommonRequest<
            HostRequestParamSchema,
            HostRequestBodySchema,
            HostRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void | Promise<void> {
        req.locals!.validateNotExist = [{ domain: this.reqBody.domain }];
        next();
    }

    protected updatePrepend(
        req: CommonRequest<
            HostRequestParamSchema,
            HostRequestBodySchema,
            HostRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void | Promise<void> {
        req.locals!.validateNotExist = [{ domain: this.reqBody.domain }];
        next();
    }
}
