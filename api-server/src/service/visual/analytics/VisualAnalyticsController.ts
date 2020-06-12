import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '@service/CommonServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import Validator from '@util/validator/Validator';
import Checker from '@util/checker';
import CommonConstant from '@common/constant';
import VisualCommonController from '@service/visual/VisualCommonController';
import VisualAnalyticsLogic from '@service/visual/analytics/VisualAnalyticsLogic';

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

    /**
     * Get instance
     */
    public static getInstance(): VisualAnalyticsController {
        if (!this.instance) {
            this.instance = new VisualAnalyticsController();
        }
        return this.instance;
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async createRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async deleteRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getAllRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

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

            this.validator.validate(this.requestQuery);

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
                    { month: { $gte: fromMonth } },
                    { month: { $lte: toMonth } },
                    { year: { $gte: fromYear } },
                    { year: { $lte: toYear } },
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
            const documents = (
                await this.visualAnalysisLogic.getAll({ conditions })
            ).documents;
            const responseBody = {
                analytics: documents.map((document) =>
                    this.visualAnalysisLogic.convertToApiResponse(document)
                ),
            };

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                responseBody
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
    protected async getByIdRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async updateRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getDocumentAmount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const documentAmount = await this.visualAnalysisLogic.getDocumentAmount();

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                { schema: 'visual-analytics', documentAmount }
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
