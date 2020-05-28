import { NextFunction, Request, Response } from 'express';
import VisualCommonController from '../../visual.common.controller';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';
import { VisualWardApiModel, VisualWardDocumentModel } from './visual.ward.interface';
import VisualizationWardModel from './visual.ward.model';
import VisualWardLogic from './visual.ward.logic';

const commonPath = '/wards';
const specifyIdPath = '/ward/:id';

export default class VisualWardController extends VisualCommonController {
    private static instance: VisualWardController;

    private visualizationWardLogic: VisualWardLogic = VisualWardLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualWardController {
        if (!this.instance) {
            this.instance = new VisualWardController();
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
            const documents: VisualWardDocumentModel[] = await VisualizationWardModel.find();
            if (this.populate) {
                for (const document of documents) {
                    await this.visualizationWardLogic.populateDocument(document);
                }
            }

            const responseBody: object = {
                wards: documents.map(
                    (document): VisualWardApiModel => this.visualizationWardLogic.convertToApiResponse(document)
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
