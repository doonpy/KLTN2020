import { NextFunction, Request, Response } from 'express';
import VisualizationCommonController from '../../visualization.common.controller';
import CommonServiceControllerBase from '../../../../common/service/common.service.controller.base';
import ResponseStatusCode from '../../../../common/common.response-status.code';
import VisualizationSummaryDistrictWardLogic from './visualization.summary.district-ward.logic';
import {
    VisualizationSummaryDistrictWardApiModel,
    VisualizationSummaryDistrictWardDocumentModel,
} from './visualization.summary.district-ward.interface';
import VisualizationSummaryDistrictWardModel from './visualization.summary.district-ward.model';

const commonPath = '/summary-district-ward';
const specifyIdPath = '/summary-district-ward/:id';

export default class VisualizationSummaryDistrictWardController extends VisualizationCommonController {
    private static instance: VisualizationSummaryDistrictWardController;

    private visualizationSummaryDistrictWardLogic: VisualizationSummaryDistrictWardLogic = VisualizationSummaryDistrictWardLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualizationSummaryDistrictWardController {
        if (!this.instance) {
            this.instance = new VisualizationSummaryDistrictWardController();
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
            const documents: VisualizationSummaryDistrictWardDocumentModel[] = await VisualizationSummaryDistrictWardModel.find();

            if (this.populate) {
                for (const document of documents) {
                    await this.visualizationSummaryDistrictWardLogic.populateDocument(document);
                }
            }
            const responseBody: object = {
                summaryDistrictWard: documents.map(
                    (document): VisualizationSummaryDistrictWardApiModel =>
                        this.visualizationSummaryDistrictWardLogic.convertToApiResponse(document)
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
