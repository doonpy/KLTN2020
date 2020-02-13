import express, { Request, Response } from 'express';
import ApiResponse from '../../util/api-response';
import { Constant } from '../../util/definition/constant';
import Validator from '../validator/validator';
import IntegerChecker from '../checker/type/integer.checker';
import IntegerRangeChecker from '../checker/integer-range.checker';

abstract class ControllerBase {
    protected commonPath: string = '';
    protected specifyIdPath: string = '';
    protected limit: number = 100;
    protected offset: number = 0;
    protected hasNext: boolean = false;
    protected router: any = express.Router();
    protected apiResponse: ApiResponse = new ApiResponse();
    protected requestBody: any = {};

    protected readonly PARAM_ID: string = 'id';
    protected readonly PARAM_LIMIT: string = 'limit';
    protected readonly PARAM_OFFSET: string = 'offset';

    protected constructor() {}

    protected initRoutes(): void {
        this.router.get(this.commonPath, this.getAllRoute);
        this.router.get(this.specifyIdPath, this.getWithIdRoute);
        this.router.post(this.commonPath, this.createRoute);
        this.router.put(this.specifyIdPath, this.updateRoute);
        this.router.delete(this.specifyIdPath, this.deleteRoute);
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
     * Initialize default inputs
     *
     * @param req
     */
    protected initInputs(req: Request): void {
        let limit: number = Number(req.query.limit);
        let offset: number = Number(req.query.offset);

        this.limit = limit || Constant.DEFAULT_VALUE.LIMIT;

        this.offset = offset || Constant.DEFAULT_VALUE.OFFSET;

        this.requestBody = {};
        if (Object.keys(req.body).length > 0) {
            this.requestBody = req.body;
        }
    }

    /**
     * @param items
     *
     * @return Array<object>
     */
    protected handleItemsList(items: Array<object>): Array<object> {
        let itemsList: Array<object> = [];
        let totalItem: number = items.length;

        if (this.offset > totalItem) {
            return itemsList;
        }

        if (totalItem < this.limit) {
            return items;
        }

        items.splice(0, this.offset).length;
        itemsList = items.splice(0, this.limit);

        this.hasNext = this.offset + itemsList.length < totalItem;

        return itemsList;
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
}

export default ControllerBase;
