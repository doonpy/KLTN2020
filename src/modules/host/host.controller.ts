import { Request, Response } from 'express';
import ControllerBase from '../base/controller.base';
import HostLogic from './host.logic';
import { Constant } from '../../util/definition/constant';
import Validator from '../validator/validator';
import StringChecker from '../checker/type/string.checker';
import StringLengthChecker from '../checker/string-length.checker';
import DomainChecker from '../checker/domain.checker';

const commonPath: string = '/hosts';
const specifyIdPath: string = '/hosts/:id';

class HostController extends ControllerBase {
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
        const validator = this.createCommonValidator();

        validator.validate(req.query);
        validator.validate(req.body);

        this.initInputs(req);

        this.hostLogic
            .getAll()
            .then((hosts: Array<object>) => {
                let handledHosts: Array<object> = this.handleItemsList(hosts);
                let responseBody: object = {
                    hosts: handledHosts,
                    hasNext: this.hasNext,
                };

                this.apiResponse.sendResponse(
                    Constant.RESPONSE_STATUS_CODE.OK,
                    responseBody,
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
    protected getWithIdRoute = (
        req: Request,
        res: Response,
        next: any
    ): void => {
        const validator = new Validator();
        validator.addParamValidator(this.PARAM_ID, new StringChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new StringLengthChecker(1, null)
        );

        validator.validate(req.params);

        this.initInputs(req);

        this.hostLogic
            .getById(req.params.id)
            .then((host: object) => {
                let responseBody: object = {
                    host: host,
                };

                this.apiResponse.sendResponse(
                    Constant.RESPONSE_STATUS_CODE.OK,
                    responseBody,
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
    protected createRoute = (req: Request, res: Response, next: any): void => {
        const validator = new Validator();
        validator.addParamValidator(this.PARAM_DOMAIN, new StringChecker());
        validator.addParamValidator(
            this.PARAM_DOMAIN,
            new StringLengthChecker(10, 100)
        );
        validator.addParamValidator(this.PARAM_DOMAIN, new DomainChecker());

        validator.addParamValidator(this.PARAM_NAME, new StringChecker());
        validator.addParamValidator(
            this.PARAM_NAME,
            new StringLengthChecker(1, 100)
        );

        validator.validate(req.body);

        this.initInputs(req);

        this.hostLogic
            .create(this.requestBody)
            .then((createdHost: object) => {
                this.apiResponse.sendResponse(
                    Constant.RESPONSE_STATUS_CODE.CREATED,
                    createdHost,
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
        validator.addParamValidator(this.PARAM_ID, new StringChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new StringLengthChecker(1, null)
        );

        validator.addParamValidator(this.PARAM_DOMAIN, new StringChecker());
        validator.addParamValidator(
            this.PARAM_DOMAIN,
            new StringLengthChecker(10, 100)
        );
        validator.addParamValidator(this.PARAM_DOMAIN, new DomainChecker());

        validator.addParamValidator(this.PARAM_NAME, new StringChecker());
        validator.addParamValidator(
            this.PARAM_NAME,
            new StringLengthChecker(1, 100)
        );

        validator.validate(req.body);
        validator.validate(req.params);

        this.initInputs(req);

        this.hostLogic
            .update(req.params.id, this.requestBody)
            .then((editedHost: object) => {
                this.apiResponse.sendResponse(
                    Constant.RESPONSE_STATUS_CODE.OK,
                    editedHost,
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
    protected deleteRoute = (req: Request, res: Response, next: any): void => {
        const validator = new Validator();
        validator.addParamValidator(this.PARAM_ID, new StringChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new StringLengthChecker(1, null)
        );

        validator.validate(req.params);

        this.hostLogic
            .delete(req.params.id)
            .then(() => {
                this.apiResponse.sendResponse(
                    Constant.RESPONSE_STATUS_CODE.NO_CONTENT,
                    {},
                    res
                );
            })
            .catch((error: Error): void => {
                next(error);
            });
    };
}

export default HostController;
