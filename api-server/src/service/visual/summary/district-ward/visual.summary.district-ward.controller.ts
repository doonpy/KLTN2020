import { NextFunction, Request, Response } from 'express';
import VisualCommonController from '../../visual.common.controller';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';
import VisualSummaryDistrictWardLogic from './visual.summary.district-ward.logic';
import {
    VisualSummaryDistrictWardApiModel,
    VisualSummaryDistrictWardDocumentModel,
} from './visual.summary.district-ward.interface';
import VisualizationSummaryDistrictWardModel from './visual.summary.district-ward.model';

const commonPath = '/summary-district-ward';
const specifyIdPath = '/summary-district-ward/:id';

export default class VisualSummaryDistrictWardController extends VisualCommonController {
    private static instance: VisualSummaryDistrictWardController;

    private visualSummaryDistrictWardLogic: VisualSummaryDistrictWardLogic = VisualSummaryDistrictWardLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualSummaryDistrictWardController {
        if (!this.instance) {
            this.instance = new VisualSummaryDistrictWardController();
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
            const documents: VisualSummaryDistrictWardDocumentModel[] = await VisualizationSummaryDistrictWardModel.find();

            if (this.populate) {
                for (const document of documents) {
                    await this.visualSummaryDistrictWardLogic.populateDocument(document);
                }
            }
            const responseBody: object = {
                summaryDistrictWard: documents.map(
                    (document): VisualSummaryDistrictWardApiModel =>
                        this.visualSummaryDistrictWardLogic.convertToApiResponse(document)
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
