import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';
import VisualCommonController from '../../visual.common.controller';
import VisualSummaryDistrictWardLogic from './visual.summary.district-ward.logic';

const commonPath = '/summary-district-ward';
const specifyIdPath = '/summary-district-ward/:id';

export default class VisualSummaryDistrictWardController extends VisualCommonController {
    private static instance: VisualSummaryDistrictWardController;

    private visualSummaryDistrictWardLogic = VisualSummaryDistrictWardLogic.getInstance();

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
            const { documents } = await this.visualSummaryDistrictWardLogic.getAll({});
            const responseBody = {
                summaryDistrictWard: documents.map((document) =>
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
    protected async getByIdRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getDocumentAmount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const documentAmount = await this.visualSummaryDistrictWardLogic.getDocumentAmount();

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                { schema: 'visual-summary-district-ward', documentAmount },
                res
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
