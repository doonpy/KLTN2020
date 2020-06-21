import { NextFunction, Request, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import VisualCommonController from '../../VisualCommonController';
import VisualAdministrativeDistrictLogic from './VisualAdministrativeDistrictLogic';

const commonPath = '/administrative/districts';
const specifyIdPath = '/administrative/district/:id';

export default class VisualAdministrativeDistrictController extends VisualCommonController {
    private static instance: VisualAdministrativeDistrictController;

    private visualAdministrativeDistrictLogic = VisualAdministrativeDistrictLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualAdministrativeDistrictController {
        if (!this.instance) {
            this.instance = new VisualAdministrativeDistrictController();
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
                hasNext,
            } = await this.visualAdministrativeDistrictLogic.getAll({
                limit: this.limit,
                offset: this.offset,
            });
            const responseBody = {
                countries: documents.map((document) =>
                    this.visualAdministrativeDistrictLogic.convertToApiResponse(
                        document
                    )
                ),
                hasNext,
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
            const documentAmount = await this.visualAdministrativeDistrictLogic.getDocumentAmount();

            ServiceControllerBase.sendResponse(res, ResponseStatusCode.OK, {
                schema: 'visual-administrative-district',
                documentAmount,
            });
        } catch (error) {
            next(this.createServiceError(error, this.language));
        }
    }
}
