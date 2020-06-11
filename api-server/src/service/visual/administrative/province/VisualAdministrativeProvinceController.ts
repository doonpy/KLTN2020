import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '@service/CommonServiceControllerBase';
import ResponseStatusCode from '@common/response-status-code';
import VisualCommonController from '../../VisualCommonController';
import VisualAdministrativeProvinceLogic from './VisualAdministrativeProvinceLogic';

const commonPath = '/administrative/provinces';
const specifyIdPath = '/administrative/province/:id';

export default class VisualAdministrativeProvinceController extends VisualCommonController {
    private static instance: VisualAdministrativeProvinceController;

    private visualAdministrativeProvinceLogic = VisualAdministrativeProvinceLogic.getInstance();

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualAdministrativeProvinceController {
        if (!this.instance) {
            this.instance = new VisualAdministrativeProvinceController();
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
            } = await this.visualAdministrativeProvinceLogic.getAll({
                limit: this.limit,
                offset: this.offset,
            });

            const responseBody = {
                provinces: documents.map((document) =>
                    this.visualAdministrativeProvinceLogic.convertToApiResponse(
                        document
                    )
                ),
                hasNext,
            };

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                responseBody
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
            const documentAmount = await this.visualAdministrativeProvinceLogic.getDocumentAmount();

            CommonServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                { schema: 'visual-administrative-province', documentAmount }
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
