import { NextFunction, Request, Response } from 'express';
import ControllerBase from '../controller.base';
import Validator from '../../util/validator/validator';
import Checker from '../../util/checker/checker.index';
import DetailUrlLogic from './detail-url.logic';
import DetailUrlModelInterface from './detail-url.model.interface';
import ResponseStatusCode from '../../common/common.response-status.code';

const commonPath = '/detail-urls';
const specifyIdPath = '/detail-urls/:id';

export default class DetailUrlController extends ControllerBase {
    private detailUrlLogic: DetailUrlLogic = new DetailUrlLogic();

    private readonly PARAM_CATALOG_ID: string = 'catalogId';

    private readonly PARAM_URL: string = 'url';

    private readonly PARAM_IS_EXTRACTED: string = 'isExtracted';

    private readonly PARAM_REQUEST_RETRIES: string = 'requestRetries';

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
    protected getAllRoute = (req: Request, res: Response, next: NextFunction): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_LIMIT, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_LIMIT, new Checker.IntegerRange(1, 1000));

        validator.addParamValidator(this.PARAM_OFFSET, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_OFFSET, new Checker.IntegerRange(0, null));

        validator.addParamValidator(this.PARAM_POPULATE, new Checker.Type.Boolean());

        validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestQuery);

        this.detailUrlLogic
            .getAll(
                { [this.PARAM_CATALOG_ID]: this.requestQuery[this.PARAM_CATALOG_ID] },
                this.populate,
                this.limit,
                this.offset
            )
            .then(({ detailUrls, hasNext }): void => {
                const detailUrlList: object[] = detailUrls.map((detailUrl: DetailUrlModelInterface): object => {
                    return DetailUrlLogic.convertToResponse(detailUrl, this.populate);
                });

                const responseBody: object = {
                    detailUrls: detailUrlList,
                    hasNext,
                };

                ControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
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
    protected getWithIdRoute = (req: Request, res: Response, next: NextFunction): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.detailUrlLogic
            .getById(this.requestParams[this.PARAM_ID])
            .then((detailUrl: DetailUrlModelInterface | null): void => {
                let responseBody: object = {};
                if (detailUrl) {
                    responseBody = {
                        detailUrl: DetailUrlLogic.convertToResponse(detailUrl),
                    };
                }

                ControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
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
    protected createRoute = (req: Request, res: Response, next: NextFunction): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.IntegerRange(1, null));

        validator.addParamValidator(this.PARAM_URL, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_URL, new Checker.StringLength(1, null));

        validator.validate((this.requestBody as unknown) as string);

        this.detailUrlLogic
            .create((this.requestBody as unknown) as DetailUrlModelInterface)
            .then((createdDetailUrl: DetailUrlModelInterface): void => {
                ControllerBase.sendResponse(
                    ResponseStatusCode.CREATED,
                    DetailUrlLogic.convertToResponse(createdDetailUrl),
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
    protected updateRoute = (req: Request, res: Response, next: NextFunction): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_CATALOG_ID, new Checker.IntegerRange(1, null));

        validator.addParamValidator(this.PARAM_URL, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_URL, new Checker.StringLength(1, 100));

        validator.addParamValidator(this.PARAM_IS_EXTRACTED, new Checker.Type.Boolean());

        validator.addParamValidator(this.PARAM_REQUEST_RETRIES, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_REQUEST_RETRIES, new Checker.IntegerRange(0, null));

        validator.validate(this.requestParams);
        validator.validate((this.requestBody as unknown) as string);

        this.detailUrlLogic
            .update(this.requestParams[this.PARAM_ID], (this.requestBody as unknown) as DetailUrlModelInterface)
            .then((editedDetailUrl: DetailUrlModelInterface | undefined): void => {
                if (editedDetailUrl) {
                    ControllerBase.sendResponse(
                        ResponseStatusCode.OK,
                        DetailUrlLogic.convertToResponse(editedDetailUrl),
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
    protected deleteRoute = (req: Request, res: Response, next: NextFunction): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.detailUrlLogic
            .delete(this.requestParams[this.PARAM_ID])
            .then((): void => {
                ControllerBase.sendResponse(ResponseStatusCode.NO_CONTENT, {}, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    };
}
