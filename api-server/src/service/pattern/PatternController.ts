import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import {
    PatternMainLocator,
    PatternDocumentModel,
    PatternRequestBodySchema,
    PatternRequestParamSchema,
    PatternRequestQuerySchema,
    PatternPostDate,
    PatternSubLocator,
} from './interface';
import PatternLogic from './PatternLogic';
import Joi from '@hapi/joi';
import { CommonRequest } from '@service/interface';

const commonPath = '/patterns';
const commonName = 'patterns';
const specifyIdPath = '/pattern/:id';
const specifyName = 'pattern';

export default class PatternController extends ServiceControllerBase<
    PatternRequestParamSchema,
    PatternRequestQuerySchema,
    PatternRequestBodySchema
> {
    private static instance: PatternController;
    private readonly PARAM_SOURCE_URL = 'sourceUrl';

    constructor() {
        super(commonName, specifyName, PatternLogic.getInstance());
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    public static getInstance(): PatternController {
        if (!this.instance) {
            this.instance = new PatternController();
        }

        return this.instance;
    }

    protected initValidateSchema(): void {
        this.reqQuerySchema = this.reqQuerySchema.keys({
            sourceUrl: Joi.string(),
        });

        this.reqBodySchema = Joi.object<PatternRequestBodySchema>({
            sourceUrl: Joi.string()
                .regex(/:\/\/[0-9a-z-.]+\.[a-z]+(\/.*)?/i)
                .uri({
                    scheme: [/https?/],
                }),
            mainLocator: Joi.object<PatternMainLocator>({
                propertyType: Joi.string(),
                title: Joi.string(),
                describe: Joi.string(),
                price: Joi.string(),
                acreage: Joi.string(),
                address: Joi.string(),
                postDate: Joi.object<PatternPostDate>({
                    locator: Joi.string(),
                    format: Joi.string(),
                    delimiter: Joi.string(),
                }),
            }),
            subLocator: Joi.array().items(
                Joi.object<PatternSubLocator>({
                    name: Joi.string(),
                    value: Joi.string(),
                })
            ),
        });
    }

    protected setRequiredInputForValidateSchema(): void {
        this.reqBodySchema = this.reqBodySchema.append({
            sourceUrl: Joi.required(),
            mainLocator: Joi.object<PatternMainLocator>({
                propertyType: Joi.required(),
                title: Joi.required(),
                describe: Joi.required(),
                price: Joi.required(),
                acreage: Joi.required(),
                address: Joi.required(),
                postDate: Joi.object<PatternPostDate>({
                    locator: Joi.required(),
                    format: Joi.required(),
                    delimiter: Joi.required(),
                }),
            }),
            subLocator: Joi.array().items(
                Joi.object<PatternSubLocator>({
                    name: Joi.required(),
                    value: Joi.required(),
                })
            ),
        });
    }

    protected getAllPrepend(
        req: CommonRequest<
            PatternRequestParamSchema,
            PatternRequestBodySchema,
            PatternRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.getConditions = this.buildQueryConditions([
            { paramName: this.PARAM_SOURCE_URL, isString: true },
        ]);
        next();
    }

    protected createPrepend(
        req: CommonRequest<
            PatternRequestParamSchema,
            PatternRequestBodySchema,
            PatternRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.validateNotExist = [{ sourceUrl: this.reqBody.sourceUrl }];
        next();
    }

    protected async updatePrepend(
        req: CommonRequest<
            PatternRequestParamSchema,
            PatternRequestBodySchema,
            PatternRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentPattern = (await this.logicInstance.getById(
                Number(this.reqParam.id)
            )) as PatternDocumentModel;
            if (
                currentPattern &&
                currentPattern.sourceUrl !== this.reqBody.sourceUrl
            ) {
                req.locals!.validateNotExist = [
                    { sourceUrl: this.reqBody.sourceUrl },
                ];
            }
            next();
        } catch (error) {
            next(error);
        }
        next();
    }
}
