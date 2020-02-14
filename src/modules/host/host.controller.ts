import { Request, Response } from 'express';
import ControllerBase from '../base/controller.base';
import HostLogic from './host.logic';
import { Constant } from '../../util/definition/constant';
import Validator from '../validator/validator';
import StringChecker from '../checker/type/string.checker';
import StringLengthChecker from '../checker/string-length.checker';
import DomainChecker from '../checker/domain.checker';
import IntegerChecker from '../checker/type/integer.checker';
import IntegerRangeChecker from '../checker/integer-range.checker';

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
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_LIMIT, new IntegerChecker());
        validator.addParamValidator(
            this.PARAM_LIMIT,
            new IntegerRangeChecker(1, 1000)
        );

        validator.addParamValidator(this.PARAM_OFFSET, new IntegerChecker());
        validator.addParamValidator(
            this.PARAM_OFFSET,
            new IntegerRangeChecker(0, null)
        );

        validator.validate(this.requestQuery);

        this.hostLogic
            .getAll(this.limit, this.offset)
            .then((hosts: Array<object>) => {
                let responseBody: object = {
                    hosts: hosts,
                    hasNext: this.hasNext,
                };

                this.sendResponse(
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

        validator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new IntegerRangeChecker(1, null)
        );

        validator.validate(this.requestParams);

        this.hostLogic
            .getById(this.requestParams.id)
            .then((host: object) => {
                let responseBody: object = {
                    host: host,
                };

                this.sendResponse(
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

        validator.validate(this.requestBody);

        this.hostLogic
            .create(this.requestBody)
            .then((createdHost: object) => {
                this.sendResponse(
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

        validator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new IntegerRangeChecker(1, null)
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

        validator.validate(this.requestParams);
        validator.validate(this.requestBody);

        this.hostLogic
            .update(this.requestParams.id, this.requestBody)
            .then((editedHost: object) => {
                this.sendResponse(
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

        validator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new IntegerRangeChecker(1, null)
        );

        validator.validate(this.requestParams);

        this.hostLogic
            .delete(this.requestParams.id)
            .then(() => {
                this.sendResponse(
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
