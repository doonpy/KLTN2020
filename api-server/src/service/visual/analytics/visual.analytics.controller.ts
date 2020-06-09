import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';
import Validator from '@util/validator/validator';
import Checker from '@util/checker/checker.index';
import CommonConstant from '@common/common.constant';
import VisualCommonController from '@service/visual/visual.common.controller';
import VisualAnalyticsLogic from '@service/visual/analytics/visual.analytics.logic';
import { convertStringToDate } from '@util/helper/datetime';
import { VisualAnalyticsDocumentModel } from '@service/visual/analytics/visual.analytics.interface';

const commonPath = '/analyses';
const specifyIdPath = '/analysis/:id';
const DATE_FORMAT = 'dd-mm-yyyy';
const DATE_DELIMITER = '-';
const MIN_FROM_DATE = new Date(-8640000000000000);

export default class VisualAnalyticsController extends VisualCommonController {
    private static instance: VisualAnalyticsController;

    private visualAnalysisLogic = VisualAnalyticsLogic.getInstance();

    private readonly PARAM_FROM_MONTH = 'fromMonth';

    private readonly PARAM_TO_MONTH = 'toYear';

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
                new Checker.IntegerRange(1, 12)
            );

            this.validator.addParamValidator(
                this.PARAM_TO_MONTH,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_TO_MONTH,
                new Checker.IntegerRange(1, 12)
            );

            this.validator.addParamValidator(
                this.PARAM_FROM_YEAR,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_FROM_YEAR,
                new Checker.IntegerRange(0, new Date().getFullYear())
            );

            this.validator.addParamValidator(
                this.PARAM_TO_YEAR,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_TO_YEAR,
                new Checker.IntegerRange(0, new Date().getFullYear())
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

            const fromMonth = Number(this.requestQuery[this.PARAM_FROM_MONTH]);
            const toMonth = Number(this.requestQuery[this.PARAM_TO_MONTH]);
            const fromYear = Number(this.requestQuery[this.PARAM_FROM_YEAR]);
            const toYear = Number(this.requestQuery[this.PARAM_TO_YEAR]);
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
                    { transactionType: transactionType || { $gte: 1 } },
                    { propertyType: propertyType || { $gte: 1 } },
                ],
            };
            const documents = (
                await this.visualAnalysisLogic.getAll({ conditions })
            ).documents;
            const responseBody = {
                analyses: documents.map((document) =>
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
