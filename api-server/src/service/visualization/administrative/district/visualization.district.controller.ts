import { NextFunction, Request, Response } from 'express';
import VisualizationCommonController from '../../visualization.common.controller';
import CommonServiceControllerBase from '../../../../common/service/common.service.controller.base';
import ResponseStatusCode from '../../../../common/common.response-status.code';
import { VisualizationDistrictApiModel, VisualizationDistrictDocumentModel } from './visualization.district.interface';
import VisualizationDistrictModel from './visualization.district.model';
import VisualizationDistrictLogic from './visualization.district.logic';

const commonPath = '/districts';
const specifyIdPath = '/district/:id';

export default class VisualizationDistrictController extends VisualizationCommonController {
    private static instance: VisualizationDistrictController;

    private visualizationDistrictLogic: VisualizationDistrictLogic = VisualizationDistrictLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualizationDistrictController {
        if (!this.instance) {
            this.instance = new VisualizationDistrictController();
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
            const documents: VisualizationDistrictDocumentModel[] = await VisualizationDistrictModel.find();
            if (this.populate) {
                for (const document of documents) {
                    await this.visualizationDistrictLogic.populateDocument(document);
                }
            }

            const responseBody: object = {
                districts: documents.map(
                    (document): VisualizationDistrictApiModel =>
                        this.visualizationDistrictLogic.convertToApiResponse(document)
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
