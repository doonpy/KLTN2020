import { NextFunction, Request, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import VisualCommonController from '../../VisualCommonController';
import VisualAdministrativeCountryLogic from './VisualAdministrativeCountryLogic';

const commonPath = '/administrative/countries';
const specifyIdPath = '/administrative/country/:id';

export default class VisualAdministrativeCountryController extends VisualCommonController {
    private static instance: VisualAdministrativeCountryController;

    private visualAdministrativeCountryLogic = VisualAdministrativeCountryLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualAdministrativeCountryController {
        if (!this.instance) {
            this.instance = new VisualAdministrativeCountryController();
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
            } = await this.visualAdministrativeCountryLogic.getAll({
                limit: this.limit,
                offset: this.offset,
            });
            const responseBody = {
                countries: documents.map((document) =>
                    this.visualAdministrativeCountryLogic.convertToApiResponse(
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
            const documentAmount = await this.visualAdministrativeCountryLogic.getDocumentAmount();

            ServiceControllerBase.sendResponse(res, ResponseStatusCode.OK, {
                schema: 'visual-administrative-country',
                documentAmount,
            });
        } catch (error) {
            next(this.createServiceError(error, this.language));
        }
    }
}
