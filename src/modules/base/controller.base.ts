import express, { Request, Response } from 'express';
import Validator from '../validator/validator';
import IntegerChecker from '../checker/type/integer.checker';
import IntegerRangeChecker from '../checker/integer-range.checker';
import { Constant } from '../../util/definition/constant';

abstract class ControllerBase {
    protected commonPath: string = '';
    protected specifyIdPath: string = '';

    protected limit: number = 100;
    protected offset: number = 0;
    protected hasNext: boolean = false;
    protected requestBody: any = {};
    protected requestParams: any = {};
    protected requestQuery: any = {};

    protected router: any = express.Router();

    protected readonly PARAM_ID: string = 'id';
    protected readonly PARAM_LIMIT: string = 'limit';
    protected readonly PARAM_OFFSET: string = 'offset';

    protected constructor() {}

    protected initRoutes(): void {
        this.router
            .all(this.commonPath, this.initInputs.bind(this))
            .get(this.commonPath, this.getAllRoute)
            .post(this.commonPath, this.createRoute);

        this.router
            .all(this.specifyIdPath, this.initInputs.bind(this))
            .get(this.specifyIdPath, this.getWithIdRoute)
            .put(this.specifyIdPath, this.updateRoute)
            .delete(this.specifyIdPath, this.deleteRoute);
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected abstract getAllRoute(
        req: Request,
        res: Response,
        next: any
    ): void;

    /**
     * @param req
     * @param res
     * @param next
     */
    protected abstract getWithIdRoute(
        req: Request,
        res: Response,
        next: any
    ): void;

    /**
     * @param req
     * @param res
     * @param next
     */
    protected abstract createRoute(
        req: Request,
        res: Response,
        next: any
    ): void;

    /**
     * @param req
     * @param res
     * @param next
     */
    protected abstract updateRoute(
        req: Request,
        res: Response,
        next: any
    ): void;

    /**
     * @param req
     * @param res
     * @param next
     */
    protected abstract deleteRoute(
        req: Request,
        res: Response,
        next: any
    ): void;

    /**
     * @param req
     * @param res
     * @param next
     */
    private initInputs(req: Request, res: Response, next: any): void {
        let limit: number = Number(req.query.limit);
        let offset: number = Number(req.query.offset);

        this.limit = limit || Constant.DEFAULT_VALUE.LIMIT;

        this.offset = offset || Constant.DEFAULT_VALUE.OFFSET;

        this.requestParams = {};
        if (Object.keys(req.params).length > 0) {
            this.requestParams = req.params;
        }

        this.requestQuery = {};
        if (Object.keys(req.query).length > 0) {
            this.requestQuery = req.query;
        }

        this.requestBody = {};
        if (Object.keys(req.body).length > 0) {
            this.requestBody = req.body;
        }

        next();
    }

    /**
     * @return Validator
     */
    protected createCommonValidator = (): Validator => {
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

        return validator;
    };

    /**
     * @param statusCode
     * @param body
     * @param res
     */
    protected sendResponse(
        statusCode: number = Constant.RESPONSE_STATUS_CODE
            .INTERNAL_SERVER_ERROR,
        body: object = {},
        res: Response
    ): void {
        if (statusCode === Constant.RESPONSE_STATUS_CODE.NO_CONTENT) {
            res.status(statusCode).json();
        } else {
            res.status(statusCode).json(body);
        }
    }
}

export default ControllerBase;
