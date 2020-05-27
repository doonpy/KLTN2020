import { NextFunction, Request, Response } from 'express';
import VisualizationCommonController from '../../visualization.common.controller';
import VisualizationCountryLogic from './visualization.country.logic';
import VisualizationCountryModel from './visualization.country.model';
import { VisualizationCountryApiModel, VisualizationCountryDocumentModel } from './visualization.country.interface';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';

const commonPath = '/countries';
const specifyIdPath = '/country/:id';

export default class VisualizationCountryController extends VisualizationCommonController {
    private static instance: VisualizationCountryController;

    private visualizationCountryLogic: VisualizationCountryLogic = VisualizationCountryLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualizationCountryController {
        if (!this.instance) {
            this.instance = new VisualizationCountryController();
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
            const documents: VisualizationCountryDocumentModel[] = await VisualizationCountryModel.find();
            const responseBody: object = {
                provinces: documents.map(
                    (document): VisualizationCountryApiModel =>
                        this.visualizationCountryLogic.convertToApiResponse(document)
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
