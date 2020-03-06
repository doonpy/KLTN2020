import { Request, Response } from 'express';
import ControllerBase from '../controller.base';
import HostLogic from './host.logic';
import Validator from '../validator/validator';
import { Checker } from '../checker/checker.index';
import HostModelInterface from './host.model.interface';
import { Common } from '../../common/common.index';

const commonPath: string = '/hosts';
const specifyIdPath: string = '/hosts/:id';

export default class HostController extends ControllerBase {
    private hostLogic: HostLogic = new HostLogic();
    private readonly PARAM_NAME: string = 'name';
    private readonly PARAM_DOMAIN: string = 'domain';

    constructor() {
        super();
        this.commonPath = commonPath;
        this.specifyIdPath = specifyIdPath;
        this.initRoutes();
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected getAllRoute = (req: Request, res: Response, next: any): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_LIMIT, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_LIMIT, new Checker.IntegerRange(1, 1000));

        validator.addParamValidator(this.PARAM_OFFSET, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_OFFSET, new Checker.IntegerRange(0, null));

        validator.addParamValidator(this.PARAM_KEYWORD, new Checker.Type.String());

        validator.validate(this.requestQuery);

        this.hostLogic
            .getAll(this.keyword, this.limit, this.offset)
            .then(({ hosts, hasNext }): void => {
                let hostList: Array<object> = hosts.map((host: HostModelInterface): object => {
                    return HostLogic.convertToResponse(host);
                });

                let responseBody: object = {
                    hosts: hostList,
                    hasNext: hasNext,
                };

                this.sendResponse(Common.ResponseStatusCode.OK, responseBody, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    };

    /**
     * @param req
     * @param res
     * @param next
     */
    protected getWithIdRoute = (req: Request, res: Response, next: any): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.hostLogic
            .getById(this.requestParams[this.PARAM_ID])
            .then((host: HostModelInterface | null): void => {
                let responseBody: object = {};
                if (host) {
                    responseBody = {
                        host: HostLogic.convertToResponse(host),
                    };
                }

                this.sendResponse(Common.ResponseStatusCode.OK, responseBody, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    };

    /**
     * @param req
     * @param res
     * @param next
     */
    protected createRoute = (req: Request, res: Response, next: any): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_DOMAIN, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_DOMAIN, new Checker.StringLength(10, 100));
        validator.addParamValidator(this.PARAM_DOMAIN, new Checker.Domain());

        validator.addParamValidator(this.PARAM_NAME, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_NAME, new Checker.StringLength(1, 100));

        validator.validate(this.requestBody);

        this.hostLogic
            .create(this.requestBody)
            .then((createdHost: HostModelInterface): void => {
                this.sendResponse(
                    Common.ResponseStatusCode.CREATED,
                    HostLogic.convertToResponse(createdHost),
                    res
                );
            })
            .catch((error: Error): void => {
                next(error);
            });
    };

    /**
     * @param req
     * @param res
     * @param next
     */
    protected updateRoute = (req: Request, res: Response, next: any): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.addParamValidator(this.PARAM_DOMAIN, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_DOMAIN, new Checker.StringLength(10, 100));
        validator.addParamValidator(this.PARAM_DOMAIN, new Checker.Domain());

        validator.addParamValidator(this.PARAM_NAME, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_NAME, new Checker.StringLength(1, 100));

        validator.validate(this.requestParams);
        validator.validate(this.requestBody);

        this.hostLogic
            .update(this.requestParams[this.PARAM_ID], this.requestBody)
            .then((editedHost: HostModelInterface | undefined): void => {
                if (editedHost) {
                    this.sendResponse(
                        Common.ResponseStatusCode.OK,
                        HostLogic.convertToResponse(editedHost),
                        res
                    );
                }
            })
            .catch((error: Error): void => {
                next(error);
            });
    };

    /**
     * @param req
     * @param res
     * @param next
     */
    protected deleteRoute = (req: Request, res: Response, next: any): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.hostLogic
            .delete(this.requestParams[this.PARAM_ID])
            .then((): void => {
                this.sendResponse(Common.ResponseStatusCode.NO_CONTENT, {}, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    };
}
