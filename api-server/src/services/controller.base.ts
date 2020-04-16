import { NextFunction, Request, Response, Router } from 'express';
import ResponseStatusCode from '../common/common.response-status.code';

export default abstract class ControllerBase {
    protected commonPath = '';

    protected specifyIdPath = '';

    protected limit = 100;

    protected offset = 0;

    protected populate = false;

    protected keyword = '';

    protected hasNext = false;

    protected requestBody: { [key: string]: string | { [key: string]: string } | [] } = {};

    protected requestParams: { [key: string]: string } = {};

    protected requestQuery: { [key: string]: string } = {};

    public router: Router = Router();

    protected readonly PARAM_ID: string = 'id';

    protected readonly PARAM_LIMIT: string = 'limit';

    protected readonly PARAM_OFFSET: string = 'offset';

    protected readonly PARAM_KEYWORD: string = 'keyword';

    protected readonly PARAM_POPULATE: string = 'populate';

    protected initRoutes(): void {
        this.router
            .all(this.commonPath, this.initInputs.bind(this))
            .get(this.commonPath, this.getAllRoute.bind(this))
            .post(this.commonPath, this.createRoute.bind(this));

        this.router
            .all(this.specifyIdPath, this.initInputs.bind(this))
            .get(this.specifyIdPath, this.getWithIdRoute.bind(this))
            .put(this.specifyIdPath, this.updateRoute.bind(this))
            .delete(this.specifyIdPath, this.deleteRoute.bind(this));
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected abstract getAllRoute(req: Request, res: Response, next: NextFunction): void;

    /**
     * @param req
     * @param res
     * @param next
     */
    protected abstract getWithIdRoute(req: Request, res: Response, next: NextFunction): void;

    /**
     * @param req
     * @param res
     * @param next
     */
    protected abstract createRoute(req: Request, res: Response, next: NextFunction): void;

    /**
     * @param req
     * @param res
     * @param next
     */
    protected abstract updateRoute(req: Request, res: Response, next: NextFunction): void;

    /**
     * @param req
     * @param res
     * @param next
     */
    protected abstract deleteRoute(req: Request, res: Response, next: NextFunction): void;

    /**
     * @param req
     * @param res
     * @param next
     */
    private initInputs(req: Request, res: Response, next: NextFunction): void {
        const limit = Number(req.query.limit);
        const offset = Number(req.query.offset);

        this.limit = limit || this.limit;
        this.offset = offset || this.offset;
        this.populate = req.query.populate === 'true';
        this.keyword = (req.query.keyword ? decodeURI(req.query.keyword as string) : this.keyword).trim();

        this.requestParams = {};
        if (Object.keys(req.params).length > 0) {
            this.requestParams = req.params;
        }

        this.requestQuery = {};
        if (Object.keys(req.query).length > 0) {
            this.requestQuery = req.query as { [key: string]: string };
        }

        this.requestBody = {};
        if (Object.keys(req.body).length > 0) {
            this.requestBody = req.body;
        }

        next();
    }

    /**
     * @param statusCode
     * @param body
     * @param res
     */
    protected static sendResponse(
        statusCode: number = ResponseStatusCode.INTERNAL_SERVER_ERROR,
        body: object = {},
        res: Response
    ): void {
        if (statusCode === ResponseStatusCode.NO_CONTENT) {
            res.status(statusCode).json();
        } else {
            res.status(statusCode).json(body);
        }
    }
}
