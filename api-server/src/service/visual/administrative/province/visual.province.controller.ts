import { NextFunction, Request, Response } from 'express';
import VisualCommonController from '../../visual.common.controller';
import VisualProvinceLogic from './visual.province.logic';
import VisualizationProvinceModel from './visual.province.model';
import { VisualProvinceApiModel, VisualProvinceDocumentModel } from './visual.province.interface';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';

const commonPath = '/provinces';
const specifyIdPath = '/province/:id';

export default class VisualProvinceController extends VisualCommonController {
    private static instance: VisualProvinceController;

    private visualizationProvinceLogic: VisualProvinceLogic = VisualProvinceLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualProvinceController {
        if (!this.instance) {
            this.instance = new VisualProvinceController();
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
            const documents: VisualProvinceDocumentModel[] = await VisualizationProvinceModel.find();
            if (this.populate) {
                for (const document of documents) {
                    await this.visualizationProvinceLogic.populateDocument(document);
                }
            }

            const responseBody: object = {
                provinces: documents.map(
                    (document): VisualProvinceApiModel => this.visualizationProvinceLogic.convertToApiResponse(document)
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
