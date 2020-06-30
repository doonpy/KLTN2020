import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import CommonConstant from '@common/constant';
import VisualAnalyticsLogic from '@service/visual/analytics/VisualAnalyticsLogic';
import Joi from '@hapi/joi';
import {
    VisualAnalyticsRequestBodySchema,
    VisualAnalyticsRequestParamSchema,
    VisualAnalyticsRequestQuerySchema,
} from '@service/visual/analytics/interface';
import { CommonRequest } from '@service/interface';

const commonPath = '/visualization/analytics';
const commonName = 'analytics';
const specifyIdPath = '/visualization/analytics/:id';
const specifyName = 'analytic';
const MAX_MONTH = 12;
const MIN_MONTH = 1;
const MIN_YEAR = 0;
const DEFAULT_TRANSACTION_TYPE = 1;
const DEFAULT_PROPERTY_TYPE = 1;

export default class VisualAnalyticsController extends ServiceControllerBase<
    VisualAnalyticsRequestParamSchema,
    VisualAnalyticsRequestQuerySchema,
    VisualAnalyticsRequestBodySchema
> {
    private static instance: VisualAnalyticsController;

    constructor() {
        super(commonName, specifyName, VisualAnalyticsLogic.getInstance());
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    protected initValidateSchema(): void {
        this.reqQuerySchema = this.reqQuerySchema.keys({
            fromMonth: Joi.number()
                .required()
                .integer()
                .min(MIN_MONTH)
                .max(MAX_MONTH),
            fromYear: Joi.number()
                .required()
                .integer()
                .max(new Date().getFullYear()),
            toMonth: Joi.number().integer().min(MIN_MONTH).max(MAX_MONTH),
            toYear: Joi.number().integer().max(new Date().getFullYear()),
            transactionType: Joi.number()
                .integer()
                .min(DEFAULT_TRANSACTION_TYPE)
                .max(CommonConstant.TRANSACTION_TYPE.length),
            propertyType: Joi.number()
                .integer()
                .min(DEFAULT_PROPERTY_TYPE)
                .max(CommonConstant.PROPERTY_TYPE.length),
        });
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualAnalyticsController {
        if (!this.instance) {
            this.instance = new VisualAnalyticsController();
        }
        return this.instance;
    }

    protected async getAllHandler(
        req: CommonRequest<
            VisualAnalyticsRequestParamSchema,
            VisualAnalyticsRequestBodySchema,
            VisualAnalyticsRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const fromMonth = Number(this.reqQuery.fromMonth) || MIN_MONTH;
            const toMonth = Number(this.reqQuery.toMonth) || MAX_MONTH;
            const fromYear = Number(this.reqQuery.fromYear) || MIN_YEAR;
            const toYear =
                Number(this.reqQuery.toYear) || new Date().getFullYear();
            const transactionType =
                Number(this.reqQuery.transactionType) || undefined;
            const propertyType =
                Number(this.reqQuery.propertyType) || undefined;
            const conditions = {
                $and: [
                    {
                        $or: [
                            { year: fromYear, month: { $gte: fromMonth } },
                            { year: toYear, month: { $lte: toMonth } },
                        ],
                    },
                    {
                        transactionType: transactionType || {
                            $gte: DEFAULT_TRANSACTION_TYPE,
                        },
                    },
                    {
                        propertyType: propertyType || {
                            $gte: DEFAULT_PROPERTY_TYPE,
                        },
                    },
                ],
            };
            const sort = {
                year: 1,
                month: 1,
            };
            const documents = (
                await this.logicInstance.getAll({ conditions, sort })
            ).documents;
            const responseBody = {
                analytics: documents.map((document) =>
                    this.logicInstance.convertToApiResponse(document)
                ),
            };

            req.locals!.statusCode = ResponseStatusCode.OK;
            req.locals!.responseBody = responseBody;
            next();
        } catch (error) {
            next(error);
        }
    }
}
