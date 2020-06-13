import { NextFunction, Request, Response } from 'express';
import ServiceControllerBase from '@service/ServiceControllerBase';
import Validator from '@util/validator/Validator';
import Checker from '@util/checker';
import ResponseStatusCode from '@common/response-status-code';
import HostLogic from './HostLogic';
import { HostDocumentModel } from './interface';

const commonPath = '/hosts';
const specifyIdPath = '/host/:id';

export default class HostController extends ServiceControllerBase {
    private static instance: HostController;

    private hostLogic = HostLogic.getInstance();

    private readonly PARAM_NAME = 'name';

    private readonly PARAM_DOMAIN = 'domain';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * @return {HostController}
     */
    public static getInstance(): HostController {
        if (!this.instance) {
            this.instance = new HostController();
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
    protected async getAllRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_NAME,
                new Checker.Type.String()
            );

            this.validator.addParamValidator(
                this.PARAM_DOMAIN,
                new Checker.Type.String()
            );

            this.validator.validate(this.requestQuery);

            const { documents, hasNext } = await this.hostLogic.getAll({
                limit: this.limit,
                offset: this.offset,
                conditions: this.buildQueryConditions([
                    { paramName: this.PARAM_DOMAIN, isString: true },
                    { paramName: this.PARAM_NAME, isString: true },
                ]),
            });
            const hosts = documents.map((host) =>
                this.hostLogic.convertToApiResponse(host)
            );

            ServiceControllerBase.sendResponse(res, ResponseStatusCode.OK, {
                hosts,
                hasNext,
            });
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
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const host = await this.hostLogic.getById(idBody);
            const responseBody = {
                host: this.hostLogic.convertToApiResponse(host),
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
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_DOMAIN,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_DOMAIN,
                new Checker.StringLength(10, 100)
            );
            this.validator.addParamValidator(
                this.PARAM_DOMAIN,
                new Checker.Domain()
            );

            this.validator.addParamValidator(
                this.PARAM_NAME,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_NAME,
                new Checker.StringLength(1, 100)
            );

            this.validator.validate(this.requestBody);

            const hostBody = (this.requestBody as unknown) as HostDocumentModel;
            const createdHost = await this.hostLogic.create(
                hostBody,
                undefined,
                [{ [this.PARAM_DOMAIN]: hostBody.domain }]
            );

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.CREATED,
                this.hostLogic.convertToApiResponse(createdHost)
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
    protected async updateRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_DOMAIN,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_DOMAIN,
                new Checker.StringLength(10, 100)
            );
            this.validator.addParamValidator(
                this.PARAM_DOMAIN,
                new Checker.Domain()
            );

            this.validator.addParamValidator(
                this.PARAM_NAME,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_NAME,
                new Checker.StringLength(1, 100)
            );

            this.validator.validate(this.requestParams);
            this.validator.validate(this.requestBody);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const hostBody = (this.requestBody as unknown) as HostDocumentModel;
            const editedHost = await this.hostLogic.update(
                idBody,
                hostBody,
                undefined,
                [{ [this.PARAM_DOMAIN]: hostBody.domain }]
            );

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                this.hostLogic.convertToApiResponse(editedHost)
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
    protected async deleteRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            await this.hostLogic.delete(idBody);

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.NO_CONTENT,
                {}
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
    protected async getDocumentAmount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const documentAmount = await this.hostLogic.getDocumentAmount();

            ServiceControllerBase.sendResponse(res, ResponseStatusCode.OK, {
                schema: 'host',
                documentAmount,
            });
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
