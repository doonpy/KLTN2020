import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';
import VisualCommonController from '../../visual.common.controller';
import VisualAdministrativeDistrictLogic from './visual.administrative.district.logic';

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

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async createRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async deleteRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
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

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                responseBody,
                res
            );
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
    protected async getByIdRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async updateRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getDocumentAmount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const documentAmount = await this.visualAdministrativeDistrictLogic.getDocumentAmount();

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                { schema: 'visual-administrative-district', documentAmount },
                res
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
