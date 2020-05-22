import { NextFunction, Request, Response } from 'express';
import VisualizationCommonController from '../visualization.common.controller';
import VisualizationProvinceLogic from './visualization.province.logic';
import VisualizationProvinceModel from './visualization.province.model';
import { VisualizationProvinceApiModel, VisualizationProvinceDocumentModel } from './visualization.province.interface';
import CommonServiceControllerBase from '../../../common/service/common.service.controller.base';
import ResponseStatusCode from '../../../common/common.response-status.code';

const commonPath = '/provinces';
const specifyIdPath = '/province/:id';

export default class VisualizationProvinceController extends VisualizationCommonController {
    private static instance: VisualizationProvinceController;

    private visualizationProvinceLogic: VisualizationProvinceLogic = VisualizationProvinceLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualizationProvinceController {
        if (!this.instance) {
            this.instance = new VisualizationProvinceController();
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
            const documents: VisualizationProvinceDocumentModel[] = await VisualizationProvinceModel.find();
            const responseBody: object = {
                provinces: documents.map(
                    (document): VisualizationProvinceApiModel =>
                        this.visualizationProvinceLogic.convertToApiResponse(document)
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
