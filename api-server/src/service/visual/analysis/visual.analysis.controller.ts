import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';
import Validator from '@util/validator/validator';
import Checker from '@util/checker/checker.index';
import CommonConstant from '@common/common.constant';
import VisualCommonController from '@service/visual/visual.common.controller';
import VisualAnalysisLogic from '@service/visual/analysis/visual.analysis.logic';
import DateTime from '@util/datetime/datetime';
import {
    VisualAnalysisApiModel,
    VisualAnalysisDocumentModel,
} from '@service/visual/analysis/visual.analysis.interface';
import VisualAnalysisModel from './visual.analysis.model';

const commonPath = '/analyses';
const specifyIdPath = '/analysis/:id';
const DATE_FORMAT = 'dd-mm-yyyy';
const DATE_DELIMITER = '-';
const MIN_DATE = new Date(-8640000000000000);

export default class VisualAnalysisController extends VisualCommonController {
    private static instance: VisualAnalysisController;

    private visualAnalysisLogic: VisualAnalysisLogic = VisualAnalysisLogic.getInstance();

    private readonly PARAM_FROM_DATE: string = 'fromDate';

    private readonly PARAM_TO_DATE: string = 'toDate';

    private readonly PARAM_TRANSACTION_TYPE: string = 'transactionType';

    private readonly PARAM_PROPERTY_TYPE: string = 'propertyType';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualAnalysisController {
        if (!this.instance) {
            this.instance = new VisualAnalysisController();
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
    protected async createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getAllRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_FROM_DATE, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_FROM_DATE, new Checker.Date(DATE_FORMAT, DATE_DELIMITER));

            this.validator.addParamValidator(this.PARAM_TO_DATE, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_TO_DATE, new Checker.Date(DATE_FORMAT, DATE_DELIMITER));

            this.validator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new Checker.Type.Integer());
            this.validator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.DecimalRange(1, CommonConstant.TRANSACTION_TYPE.length)
            );

            this.validator.addParamValidator(this.PARAM_PROPERTY_TYPE, new Checker.Type.Integer());
            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.DecimalRange(1, CommonConstant.PROPERTY_TYPE.length)
            );

            this.validator.validate(this.requestQuery);

            const conditions: object = {
                $and: [
                    {
                        referenceDate: {
                            $gte: (this.requestQuery[this.PARAM_FROM_DATE] as string)
                                ? DateTime.convertStringToDate(
                                      this.requestQuery[this.PARAM_FROM_DATE] as string,
                                      DATE_FORMAT,
                                      DATE_DELIMITER
                                  )
                                : MIN_DATE.toISOString(),
                        },
                    },
                    {
                        referenceDate: {
                            $lte: (this.requestQuery[this.PARAM_TO_DATE] as string)
                                ? DateTime.convertStringToDate(
                                      this.requestQuery[this.PARAM_TO_DATE] as string,
                                      DATE_FORMAT,
                                      DATE_DELIMITER
                                  )
                                : new Date().toISOString(),
                        },
                    },
                ],
            };
            let documents: VisualAnalysisDocumentModel[] = await VisualAnalysisModel.find(conditions);
            const transactionType: number | undefined =
                Number(this.requestQuery[this.PARAM_TRANSACTION_TYPE]) || undefined;
            const propertyType: number | undefined = Number(this.requestQuery[this.PARAM_PROPERTY_TYPE]) || undefined;

            documents = documents.filter(({ priceAnalysisData, acreageAnalysisData }): boolean => {
                acreageAnalysisData = acreageAnalysisData.filter(
                    ({ transactionType: itemTransactionType, propertyType: itemPropertyType }): boolean => {
                        if (transactionType !== undefined && itemTransactionType !== transactionType) {
                            return false;
                        }

                        if (propertyType !== undefined && itemPropertyType !== propertyType) {
                            return false;
                        }

                        return true;
                    }
                );

                priceAnalysisData = priceAnalysisData.filter(
                    ({ transactionType: itemTransactionType, propertyType: itemPropertyType }): boolean => {
                        if (transactionType !== undefined && itemTransactionType !== transactionType) {
                            return false;
                        }

                        if (propertyType !== undefined && itemPropertyType !== propertyType) {
                            return false;
                        }

                        return true;
                    }
                );

                return acreageAnalysisData.length > 0 && priceAnalysisData.length > 0;
            });

            const responseBody: object = {
                analyses: documents.map(
                    (document): VisualAnalysisApiModel => this.visualAnalysisLogic.convertToApiResponse(document)
                ),
            };

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
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
    protected async getWithIdRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }
}
