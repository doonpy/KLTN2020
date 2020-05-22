import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '../../../../common/service/common.service.controller.base';
import VisualizationSummaryDistrictModel from './visualization.summary.district.model';
import ResponseStatusCode from '../../../../common/common.response-status.code';
import {
    VisualizationSummaryDistrictApiModel,
    VisualizationSummaryDistrictDocumentModel,
} from './visualization.summary.district.interface';
import VisualizationSummaryDistrictLogic from './visualization.summary.district.logic';
import VisualizationCommonController from '../../visualization.common.controller';

const commonPath = '/summary-district';
const specifyIdPath = '/summary-district/:id';

export default class VisualizationSummaryDistrictController extends VisualizationCommonController {
    private static instance: VisualizationSummaryDistrictController;

    private visualizationSummaryDistrictLogic: VisualizationSummaryDistrictLogic = VisualizationSummaryDistrictLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualizationSummaryDistrictController {
        if (!this.instance) {
            this.instance = new VisualizationSummaryDistrictController();
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
            const documents: VisualizationSummaryDistrictDocumentModel[] = await VisualizationSummaryDistrictModel.find();

            if (this.populate) {
                for (const document of documents) {
                    await this.visualizationSummaryDistrictLogic.populateDocument(document);
                }
            }

            const responseBody: object = {
                summaryDistrict: documents.map(
                    (document): VisualizationSummaryDistrictApiModel =>
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
