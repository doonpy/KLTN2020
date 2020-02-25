import ControllerBase from '../base/controller.base';
import { Request, Response } from 'express';
import Validator from '../validator/validator';
import IntegerChecker from '../checker/type/integer.checker';
import IntegerRangeChecker from '../checker/integer-range.checker';
import StringChecker from '../checker/type/string.checker';
import { Constant } from '../../util/definition/constant';
import StringLengthChecker from '../checker/string-length.checker';
import DetailUrlLogic from './detail-url.logic';
import UrlChecker from '../checker/url.checker';
import BooleanChecker from '../checker/type/boolean.checker';
import HostLogic from '../host/host.logic';
import DetailUrlModelInterface from './detail-url.model.interface';

const commonPath: string = '/detail-urls';
const specifyIdPath: string = '/detail-urls/:id';

class DetailUrlController extends ControllerBase {
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
    protected getAllRoute = (req: Request, res: Response, next: any): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_LIMIT, new IntegerChecker());
        validator.addParamValidator(this.PARAM_LIMIT, new IntegerRangeChecker(1, 1000));

        validator.addParamValidator(this.PARAM_OFFSET, new IntegerChecker());
        validator.addParamValidator(this.PARAM_OFFSET, new IntegerRangeChecker(0, null));

        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerRangeChecker(1, null));

        validator.validate(this.requestQuery);

        this.detailUrlLogic
            .getAll(this.requestQuery[this.PARAM_CATALOG_ID], this.limit, this.offset)
            .then(({ detailUrls, hasNext }): void => {
                let detailUrlList: Array<object> = detailUrls.map(
                    (detailUrl: DetailUrlModelInterface): object => {
                        return DetailUrlLogic.convertToResponse(detailUrl);
                    }
                );

                let responseBody: object = {
                    detailUrls: detailUrlList,
                    hasNext: hasNext,
                };

                this.sendResponse(Constant.RESPONSE_STATUS_CODE.OK, responseBody, res);
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

        validator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_ID, new IntegerRangeChecker(1, null));

        validator.validate(this.requestParams);

        this.detailUrlLogic
            .getById(this.requestParams[this.PARAM_ID])
            .then((detailUrl: DetailUrlModelInterface | null): void => {
                let responseBody: object = {
                    detailUrl: DetailUrlLogic.convertToResponse(detailUrl),
                };

                this.sendResponse(Constant.RESPONSE_STATUS_CODE.OK, responseBody, res);
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

        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerRangeChecker(1, null));

        validator.addParamValidator(this.PARAM_URL, new StringChecker());
        validator.addParamValidator(this.PARAM_URL, new StringLengthChecker(1, 100));
        validator.addParamValidator(this.PARAM_URL, new UrlChecker());

        validator.validate(this.requestBody);

        this.detailUrlLogic
            .create(this.requestBody)
            .then((createdDetailUrl: DetailUrlModelInterface): void => {
                this.sendResponse(
                    Constant.RESPONSE_STATUS_CODE.CREATED,
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
    protected updateRoute = (req: Request, res: Response, next: any): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_ID, new IntegerRangeChecker(1, null));

        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerChecker());
        validator.addParamValidator(this.PARAM_CATALOG_ID, new IntegerRangeChecker(1, null));

        validator.addParamValidator(this.PARAM_URL, new StringChecker());
        validator.addParamValidator(this.PARAM_URL, new StringLengthChecker(1, 100));
        validator.addParamValidator(this.PARAM_URL, new UrlChecker());

        validator.addParamValidator(this.PARAM_IS_EXTRACTED, new BooleanChecker());

        validator.addParamValidator(this.PARAM_REQUEST_RETRIES, new IntegerChecker());
        validator.addParamValidator(this.PARAM_REQUEST_RETRIES, new IntegerRangeChecker(0, null));

        validator.validate(this.requestParams);
        validator.validate(this.requestBody);

        this.detailUrlLogic
            .update(this.requestParams[this.PARAM_ID], this.requestBody)
            .then((editedDetailUrl: DetailUrlModelInterface | undefined): void => {
                this.sendResponse(
                    Constant.RESPONSE_STATUS_CODE.OK,
                    DetailUrlLogic.convertToResponse(editedDetailUrl),
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
        validator.addParamValidator(this.PARAM_ID, new IntegerRangeChecker(1, null));

        validator.validate(this.requestParams);

        this.detailUrlLogic
            .delete(this.requestParams[this.PARAM_ID])
            .then((): void => {
                this.sendResponse(Constant.RESPONSE_STATUS_CODE.NO_CONTENT, {}, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    };
}

export default DetailUrlController;
