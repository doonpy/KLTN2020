import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '../../common/service/common.service.controller.base';
import HostLogic from './host.logic';
import Validator from '../../util/validator/validator';
import Checker from '../../util/checker/checker.index';
import ResponseStatusCode from '../../common/common.response-status.code';
import { HostApiModel, HostDocumentModel } from './host.interface';

const commonPath = '/hosts';
const specifyIdPath = '/host/:id';

export default class HostController extends CommonServiceControllerBase {
    private static instance: HostController;

    private hostLogic: HostLogic = HostLogic.getInstance();

    private readonly PARAM_NAME: string = 'name';

    private readonly PARAM_DOMAIN: string = 'domain';

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
    protected async getAllRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_NAME, new Checker.Type.String());

            this.validator.addParamValidator(this.PARAM_DOMAIN, new Checker.Type.String());

            this.validator.validate(this.requestQuery);

            const {
                documents,
                hasNext,
            }: { documents: HostDocumentModel[]; hasNext: boolean } = await this.hostLogic.getAll(
                this.limit,
                this.offset,
                this.buildQueryConditions([
                    { paramName: this.PARAM_DOMAIN, isString: true },
                    { paramName: this.PARAM_NAME, isString: true },
                ]),
                this.populate
            );
            const hosts: object[] = documents.map((host): HostApiModel => this.hostLogic.convertToApiResponse(host));

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                {
                    hosts,
                    hasNext,
                },
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
    protected async getWithIdRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            await this.hostLogic.checkExistsWithId(idBody);
            const host: HostDocumentModel = await this.hostLogic.getById(idBody);
            const responseBody: object = {
                host: this.hostLogic.convertToApiResponse(host),
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
    protected async createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_DOMAIN, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_DOMAIN, new Checker.StringLength(10, 100));
            this.validator.addParamValidator(this.PARAM_DOMAIN, new Checker.Domain());

            this.validator.addParamValidator(this.PARAM_NAME, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_NAME, new Checker.StringLength(1, 100));

            this.validator.validate(this.requestBody);

            const hostBody: HostDocumentModel = (this.requestBody as unknown) as HostDocumentModel;
            await this.hostLogic.checkExistsWithDomain(hostBody.domain, true);
            const createdHost: HostDocumentModel = await this.hostLogic.create(hostBody);

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.CREATED,
                this.hostLogic.convertToApiResponse(createdHost),
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
    protected async updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.validator.addParamValidator(this.PARAM_DOMAIN, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_DOMAIN, new Checker.StringLength(10, 100));
            this.validator.addParamValidator(this.PARAM_DOMAIN, new Checker.Domain());

            this.validator.addParamValidator(this.PARAM_NAME, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_NAME, new Checker.StringLength(1, 100));

            this.validator.validate(this.requestParams);
            this.validator.validate(this.requestBody);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const hostBody: HostDocumentModel = (this.requestBody as unknown) as HostDocumentModel;
            await this.hostLogic.checkExistsWithId(idBody);
            await this.hostLogic.checkExistsWithDomain(hostBody.domain, true);
            const editedHost: HostDocumentModel = await this.hostLogic.update(idBody, hostBody);

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                this.hostLogic.convertToApiResponse(editedHost),
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
    protected async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            await this.hostLogic.checkExistsWithId(idBody);
            await this.hostLogic.delete(idBody);

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.NO_CONTENT, {}, res);
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
