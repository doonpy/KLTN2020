import { NextFunction, Request, Response } from 'express';
import VisualCommonController from '../../visual.common.controller';
import VisualCountryLogic from './visual.country.logic';
import VisualizationCountryModel from './visual.country.model';
import { VisualCountryApiModel, VisualCountryDocumentModel } from './visual.country.interface';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';

const commonPath = '/countries';
const specifyIdPath = '/country/:id';

export default class VisualCountryController extends VisualCommonController {
    private static instance: VisualCountryController;

    private visualizationCountryLogic: VisualCountryLogic = VisualCountryLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualCountryController {
        if (!this.instance) {
            this.instance = new VisualCountryController();
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
            const documents: VisualCountryDocumentModel[] = await VisualizationCountryModel.find();
            const responseBody: object = {
                provinces: documents.map(
                    (document): VisualCountryApiModel => this.visualizationCountryLogic.convertToApiResponse(document)
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
