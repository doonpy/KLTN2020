import { NextFunction, Request, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import VisualSummaryDistrictLogic from './VisualSummaryDistrictLogic';
import VisualCommonController from '../../VisualCommonController';

const commonPath = '/summary-district';
const specifyIdPath = '/summary-district/:id';

export default class VisualSummaryDistrictController extends VisualCommonController {
    private static instance: VisualSummaryDistrictController;

    private visualSummaryDistrictLogic = VisualSummaryDistrictLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualSummaryDistrictController {
        if (!this.instance) {
            this.instance = new VisualSummaryDistrictController();
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
            const { documents } = await this.visualSummaryDistrictLogic.getAll(
                {}
            );

            const responseBody = {
                summaryDistrict: documents.map((document) =>
                    this.visualSummaryDistrictLogic.convertToApiResponse(
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
            next(this.createServiceError(error, this.language));
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
            const documentAmount = await this.visualSummaryDistrictLogic.getDocumentAmount();

            ServiceControllerBase.sendResponse(res, ResponseStatusCode.OK, {
                schema: 'visual-summary-district',
                documentAmount,
            });
        } catch (error) {
            next(this.createServiceError(error, this.language));
        }
    }
}
