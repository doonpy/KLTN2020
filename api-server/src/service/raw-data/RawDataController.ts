import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import CommonConstant from '@common/constant';
import RawDataLogic from './RawDataLogic';
import {
    RawDataAcreage,
    RawDataOther,
    RawDataPrice,
    RawDataRequestBodySchema,
    RawDataRequestParamSchema,
    RawDataRequestQuerySchema,
    RawDataStatus,
} from './interface';
import DetailUrlLogic from '../detail-url/DetailUrlLogic';
import Joi from '@hapi/joi';
import { CommonRequest } from '@service/interface';

const commonPath = '/raw-dataset';
const commonName = 'rawDataset';
const specifyIdPath = '/raw-data/:id';
const specifyName = 'rawData';

export default class RawDataController extends ServiceControllerBase<
    RawDataRequestParamSchema,
    RawDataRequestQuerySchema,
    RawDataRequestBodySchema
> {
    private static instance: RawDataController;
    private readonly PARAM_DETAIL_URL_ID = 'detailUrlId';
    private readonly PARAM_TRANSACTION_TYPE = 'transactionType';
    private readonly PARAM_PROPERTY_TYPE = 'propertyType';
    private readonly PARAM_TITLE = 'title';
    private readonly PARAM_DESCRIBE = 'describe';
    private readonly PARAM_ADDRESS = 'address';

    constructor() {
        super(commonName, specifyName, RawDataLogic.getInstance());
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    public static getInstance(): RawDataController {
        if (!this.instance) {
            this.instance = new RawDataController();
        }

        return this.instance;
    }

    protected initValidateSchema(): void {
        this.reqQuerySchema = this.reqQuerySchema.keys({
            detailUrlId: Joi.number().integer().min(CommonConstant.MIN_ID),
            propertyType: Joi.number().integer().min(CommonConstant.MIN_ID),
            transactionType: Joi.number().integer().min(CommonConstant.MIN_ID),
            title: Joi.string(),
            describe: Joi.string(),
            address: Joi.string(),
        });

        this.reqBodySchema = Joi.object<RawDataRequestBodySchema>({
            detailUrlId: Joi.number().integer().min(CommonConstant.MIN_ID),
            transactionType: Joi.number().integer().min(CommonConstant.MIN_ID),
            propertyType: Joi.number().integer().min(CommonConstant.MIN_ID),
            postDate: Joi.date(),
            title: Joi.string().trim(),
            describe: Joi.string().trim(),
            price: Joi.object<RawDataPrice>({
                value: Joi.number().min(0),
                currency: Joi.string().allow(
                    CommonConstant.PRICE_CURRENCY[0].wording,
                    CommonConstant.PRICE_CURRENCY[1].wording
                ),
                timeUnit: Joi.number().integer().min(1),
            }),
            acreage: Joi.object<RawDataAcreage>({
                value: Joi.number().min(0),
                measureUnit: Joi.string().allow('m²'),
            }),
            address: Joi.string().trim(),
            others: Joi.array().items(
                Joi.object<RawDataOther>({
                    name: Joi.string(),
                    value: Joi.string(),
                })
            ),
            coordinateId: Joi.number().integer().min(CommonConstant.MIN_ID),
            status: Joi.object<RawDataStatus>({
                isSummary: Joi.boolean(),
                isMapPoint: Joi.boolean(),
                isAnalytics: Joi.boolean(),
                isGrouped: Joi.boolean(),
            }),
        });
    }

    protected setRequiredInputForValidateSchema(): void {
        this.reqBodySchema = this.reqBodySchema.append({
            detailUrlId: Joi.required(),
            transactionType: Joi.required(),
            propertyType: Joi.required(),
            postDate: Joi.required(),
            title: Joi.required(),
            describe: Joi.required(),
            price: Joi.object<RawDataPrice>({
                value: Joi.required(),
                currency: Joi.required(),
            }),
            acreage: Joi.object<RawDataAcreage>({
                value: Joi.required(),
                measureUnit: Joi.required(),
            }),
            address: Joi.required(),
            coordinateId: Joi.required(),
        });
    }

    protected getAllPrepend(
        req: CommonRequest<
            RawDataRequestParamSchema,
            RawDataRequestBodySchema,
            RawDataRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.getConditions = this.buildQueryConditions([
            { paramName: this.PARAM_DETAIL_URL_ID, isString: false },
            { paramName: this.PARAM_TRANSACTION_TYPE, isString: false },
            { paramName: this.PARAM_PROPERTY_TYPE, isString: false },
            { paramName: this.PARAM_TITLE, isString: true },
            { paramName: this.PARAM_DESCRIBE, isString: true },
            { paramName: this.PARAM_ADDRESS, isString: true },
        ]);
        next();
    }

    protected async createPrepend(
        req: CommonRequest<
            RawDataRequestParamSchema,
            RawDataRequestBodySchema,
            RawDataRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            await DetailUrlLogic.getInstance().checkExisted({
                detailUrlId: this.reqBody.detailUrlId,
            });

            req.locals!.validateNotExist = [
                { detailUrlId: this.reqBody.detailUrlId },
            ];
            next();
        } catch (error) {
            next(error);
        }
    }

    protected async updatePrepend(
        req: CommonRequest<
            RawDataRequestParamSchema,
            RawDataRequestBodySchema,
            RawDataRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (this.reqBody.detailUrlId) {
                await DetailUrlLogic.getInstance().checkExisted({
                    detailUrlId: this.reqBody.detailUrlId,
                });
            }

            req.locals!.validateNotExist = [
                { detailUrlId: this.reqBody.detailUrlId },
            ];
            next();
        } catch (error) {
            next(error);
        }
    }

    protected getDocumentAmountPrepend(
        req: CommonRequest<
            RawDataRequestParamSchema,
            RawDataRequestBodySchema,
            RawDataRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.getConditions = this.buildQueryConditions([
            { paramName: this.PARAM_TRANSACTION_TYPE, isString: false },
            { paramName: this.PARAM_PROPERTY_TYPE, isString: false },
        ]);
        next();
    }
}
