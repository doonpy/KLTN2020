import { NextFunction, Request, Response } from 'express';
import VisualizationCommonController from '../visualization.common.controller';
import CommonServiceControllerBase from '../../../common/service/common.service.controller.base';
import ResponseStatusCode from '../../../common/common.response-status.code';
import { VisualizationWardApiModel, VisualizationWardDocumentModel } from './visualization.ward.interface';
import VisualizationWardModel from './visualization.ward.model';
import VisualizationWardLogic from './visualization.ward.logic';

const commonPath = '/wards';
const specifyIdPath = '/ward/:id';

export default class VisualizationWardController extends VisualizationCommonController {
    private static instance: VisualizationWardController;

    private visualizationWardLogic: VisualizationWardLogic = VisualizationWardLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualizationWardController {
        if (!this.instance) {
            this.instance = new VisualizationWardController();
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
            const documents: VisualizationWardDocumentModel[] = await VisualizationWardModel.find();
            if (this.populate) {
                for (const document of documents) {
                    await this.visualizationWardLogic.populateDocument(document);
                }
            }

            const responseBody: object = {
                wards: documents.map(
                    (document): VisualizationWardApiModel => this.visualizationWardLogic.convertToApiResponse(document)
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
