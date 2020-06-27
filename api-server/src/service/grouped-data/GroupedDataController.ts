import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import GroupedDataLogic from './GroupedDataLogic';
import {
    GroupedDataRequestBodySchema,
    GroupedDataRequestParamSchema,
    GroupedDataRequestQuerySchema,
} from './interface';
import RawDataLogic from '../raw-data/RawDataLogic';
import Joi from '@hapi/joi';
import CommonConstant from '@common/constant';
import { CommonRequest } from '@service/interface';

const commonPath = '/grouped-dataset';
const commonName = 'groupedDataset';
const specifyIdPath = '/grouped-data/:id';
const specifyName = 'groupedData';

export default class GroupedDataController extends ServiceControllerBase<
    GroupedDataRequestParamSchema,
    GroupedDataRequestQuerySchema,
    GroupedDataRequestBodySchema
> {
    private static instance: GroupedDataController;
    private readonly PARAM_ITEMS = 'items';

    constructor() {
        super(commonName, specifyName, GroupedDataLogic.getInstance());
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    public static getInstance(): GroupedDataController {
        if (!this.instance) {
            this.instance = new GroupedDataController();
        }

        return this.instance;
    }

    protected initValidateSchema(): void {
        this.reqQuerySchema = this.reqQuerySchema.keys({
            items: Joi.alternatives().try(
                Joi.number().integer().min(CommonConstant.MIN_ID),
                Joi.array().items(
                    Joi.number().integer().min(CommonConstant.MIN_ID)
                )
            ),
        });

        this.reqBodySchema = this.reqBodySchema.keys({
            items: Joi.array().items(
                Joi.number().integer().min(CommonConstant.MIN_ID)
            ),
        });
    }

    protected setRequiredInputForValidateSchema(): void {
        this.reqBodySchema = this.reqBodySchema.append({
            items: Joi.required(),
        });
    }

    protected getAllPrepend(
        req: CommonRequest<
            GroupedDataRequestParamSchema,
            GroupedDataRequestBodySchema,
            GroupedDataRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.getConditions = this.buildQueryConditions([
            { paramName: this.PARAM_ITEMS, isString: false },
        ]);
        next();
    }

    protected async createPrepend(
        req: CommonRequest<
            GroupedDataRequestParamSchema,
            GroupedDataRequestBodySchema,
            GroupedDataRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            for (const item of this.reqBody.items) {
                await RawDataLogic.getInstance().checkExisted({
                    [this.PARAM_DOCUMENT_ID]: item,
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    }

    protected async updatePrepend(
        req: CommonRequest<
            GroupedDataRequestParamSchema,
            GroupedDataRequestBodySchema,
            GroupedDataRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            for (const item of this.reqBody.items) {
                await RawDataLogic.getInstance().checkExisted({
                    [this.PARAM_DOCUMENT_ID]: item,
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    }
}
