import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';
import VisualizationSummaryDistrictModel from './visual.summary.district.model';
import { VisualSummaryDistrictApiModel, VisualSummaryDistrictDocumentModel } from './visual.summary.district.interface';
import VisualSummaryDistrictLogic from './visual.summary.district.logic';
import VisualCommonController from '../../visual.common.controller';

const commonPath = '/summary-district';
const specifyIdPath = '/summary-district/:id';

export default class VisualSummaryDistrictController extends VisualCommonController {
    private static instance: VisualSummaryDistrictController;

    private visualizationSummaryDistrictLogic: VisualSummaryDistrictLogic = VisualSummaryDistrictLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualSummaryDistrictController {
        if (!this.instance) {
            this.instance = new VisualSummaryDistrictController();
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
            const documents: VisualSummaryDistrictDocumentModel[] = await VisualizationSummaryDistrictModel.find();

            if (this.populate) {
                for (const document of documents) {
                    await this.visualizationSummaryDistrictLogic.populateDocument(document);
                }
            }

            const responseBody: object = {
                summaryDistrict: documents.map(
                    (document): VisualSummaryDistrictApiModel =>
                        this.visualizationSummaryDistrictLogic.convertToApiResponse(document)
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