import { NextFunction, Request, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import VisualCommonController from '../../VisualCommonController';
import VisualSummaryDistrictWardLogic from './VisualSummaryDistrictWardLogic';

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

    protected async createRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async deleteRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async getAllRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {
                documents,
            } = await this.visualSummaryDistrictWardLogic.getAll({});
            const responseBody = {
                summaryDistrictWard: documents.map((document) =>
                    this.visualSummaryDistrictWardLogic.convertToApiResponse(
                        document
                    )
                ),
            };
            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                responseBody
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    protected async getByIdRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async updateRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    protected async getDocumentAmount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const documentAmount = await this.visualSummaryDistrictWardLogic.getDocumentAmount();

            ServiceControllerBase.sendResponse(res, ResponseStatusCode.OK, {
                schema: 'visual-summary-district-ward',
                documentAmount,
            });
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
