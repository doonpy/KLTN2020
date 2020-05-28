import { NextFunction, Request, Response } from 'express';
import VisualCommonController from '../../visual.common.controller';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';
import { VisualDistrictDocumentModel, VisualizationDistrictApiModel } from './visual.district.interface';
import VisualizationDistrictModel from './visual.district.model';
import VisualDistrictLogic from './visual.district.logic';

const commonPath = '/districts';
const specifyIdPath = '/district/:id';

export default class VisualDistrictController extends VisualCommonController {
    private static instance: VisualDistrictController;

    private visualizationDistrictLogic: VisualDistrictLogic = VisualDistrictLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualDistrictController {
        if (!this.instance) {
            this.instance = new VisualDistrictController();
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
            const documents: VisualDistrictDocumentModel[] = await VisualizationDistrictModel.find();
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
