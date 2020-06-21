import { NextFunction, Request, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import Validator from '@util/validator/Validator';
import Checker from '@util/checker';
import CommonConstant from '@common/constant';
import VisualCommonController from '@service/visual/VisualCommonController';
import VisualAnalyticsLogic from '@service/visual/analytics/VisualAnalyticsLogic';
import Joi from 'hapi__joi';
import { InputParamsSchema } from '@service/visual/analytics/interface';

const commonPath = '/analytics';
const specifyIdPath = '/analytics/:id';
const MAX_MONTH = 12;
const MIN_MONTH = 1;
const MAX_YEAR = new Date().getFullYear();
const MIN_YEAR = 0;
const DEFAULT_TRANSACTION_TYPE = 1;
const DEFAULT_PROPERTY_TYPE = 1;

export default class VisualAnalyticsController extends VisualCommonController {
    private static instance: VisualAnalyticsController;

    private visualAnalysisLogic = VisualAnalyticsLogic.getInstance();

    private readonly PARAM_FROM_MONTH = 'fromMonth';

    private readonly PARAM_TO_MONTH = 'toMonth';

    private readonly PARAM_FROM_YEAR = 'fromYear';

    private readonly PARAM_TO_YEAR = 'toYear';

    private readonly PARAM_TRANSACTION_TYPE = 'transactionType';

    private readonly PARAM_PROPERTY_TYPE = 'propertyType';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    protected initValidateSchema(): void {
        this.validateSchema = Joi.object<InputParamsSchema>({
            fromMonth: Joi.number()
                .required()
                .integer()
                .min(MIN_MONTH)
                .max(MAX_MONTH),
            fromYear: Joi.number().required().integer().max(MAX_YEAR),
            toMonth: Joi.number().integer().min(MIN_MONTH).max(MAX_MONTH),
            toYear: Joi.number().integer().max(MAX_YEAR),
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

    protected async createRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async deleteRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async getAllRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_FROM_MONTH,
                new Checker.StringLength(1, null)
            );
            this.validator.addParamValidator(
                this.PARAM_FROM_MONTH,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_FROM_MONTH,
                new Checker.IntegerRange(MIN_MONTH, MAX_MONTH)
            );

            this.validator.addParamValidator(
                this.PARAM_TO_MONTH,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_TO_MONTH,
                new Checker.IntegerRange(MIN_MONTH, MAX_MONTH)
            );

            this.validator.addParamValidator(
                this.PARAM_FROM_YEAR,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_FROM_YEAR,
                new Checker.IntegerRange(MIN_YEAR, MAX_YEAR)
            );
            this.validator.addParamValidator(
                this.PARAM_FROM_YEAR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_TO_YEAR,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_TO_YEAR,
                new Checker.IntegerRange(MIN_YEAR, MAX_YEAR)
            );

            this.validator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.DecimalRange(
                    1,
                    CommonConstant.TRANSACTION_TYPE.length
                )
            );

            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.DecimalRange(1, CommonConstant.PROPERTY_TYPE.length)
            );

            // this.validator.validate(this.requestQuery);
            this.validateInputParams(this.requestQuery);
            const fromMonth =
                Number(this.requestQuery[this.PARAM_FROM_MONTH]) || MIN_MONTH;
            const toMonth =
                Number(this.requestQuery[this.PARAM_TO_MONTH]) || MAX_MONTH;
            const fromYear =
                Number(this.requestQuery[this.PARAM_FROM_YEAR]) || MIN_YEAR;
            const toYear =
                Number(this.requestQuery[this.PARAM_TO_YEAR]) || MAX_YEAR;
            const transactionType =
                Number(this.requestQuery[this.PARAM_TRANSACTION_TYPE]) ||
                undefined;
            const propertyType =
                Number(this.requestQuery[this.PARAM_PROPERTY_TYPE]) ||
                undefined;
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
                await this.visualAnalysisLogic.getAll({ conditions, sort })
            ).documents;
            const responseBody = {
                analytics: documents.map((document) =>
                    this.visualAnalysisLogic.convertToApiResponse(document)
                ),
            };

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                responseBody
            );
        } catch (error) {
            next(this.createServiceError(error, this.language));
        }
    }

    protected async getByIdRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async updateRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async getDocumentAmount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const documentAmount = await this.visualAnalysisLogic.getDocumentAmount();

            ServiceControllerBase.sendResponse(res, ResponseStatusCode.OK, {
                schema: 'visual-analytics',
                documentAmount,
            });
        } catch (error) {
            next(this.createServiceError(error, this.language));
        }
    }
}
