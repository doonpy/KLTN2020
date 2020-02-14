import { Request, Response } from 'express';
import ControllerBase from '../base/controller.base';
import CatalogLogic from './catalog.logic';
import { Constant } from '../../util/definition/constant';
import Validator from '../validator/validator';
import StringChecker from '../checker/type/string.checker';
import StringLengthChecker from '../checker/string-length.checker';
import UrlChecker from '../checker/url.checker';
import ObjectChecker from '../checker/type/object.checker';
import IntegerChecker from '../checker/type/integer.checker';
import IntegerRangeChecker from '../checker/integer-range.checker';

const commonPath: string = '/catalogs';
const specifyIdPath: string = '/catalogs/:id';

class CatalogController extends ControllerBase {
    private catalogLogic: CatalogLogic = new CatalogLogic();
    private readonly PARAM_TITLE: string = 'title';
    private readonly PARAM_URL: string = 'url';
    private readonly PARAM_LOCATOR: string = 'locator';
    private readonly PARAM_DETAIL_URL: string = 'detailUrl';
    private readonly PARAM_PAGE_NUMBER: string = 'pageNumber';
    private readonly PARAM_HOST_ID: string = 'hostId';

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
    protected getAllRoute = (req: Request, res: Response, next: any): any => {
        const validator = this.createCommonValidator();

        validator.validate(this.requestQuery);

        this.catalogLogic
            .getAll(this.limit, this.offset)
            .then(catalogs => {
                let responseBody: object = {
                    catalogs: catalogs,
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
    ): any => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new IntegerRangeChecker(1, null)
        );

        validator.validate(this.requestParams);

        this.catalogLogic
            .getById(this.requestParams.id)
            .then(catalog => {
                let responseBody: object = {
                    catalog: catalog,
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
    protected createRoute = (req: Request, res: Response, next: any): any => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_TITLE, new StringChecker());
        validator.addParamValidator(
            this.PARAM_TITLE,
            new StringLengthChecker(1, 100)
        );

        validator.addParamValidator(this.PARAM_URL, new StringChecker());
        validator.addParamValidator(this.PARAM_URL, new UrlChecker());

        validator.addParamValidator(this.PARAM_LOCATOR, new ObjectChecker());

        validator.addParamValidator(this.PARAM_DETAIL_URL, new StringChecker());
        validator.addParamValidator(
            this.PARAM_PAGE_NUMBER,
            new StringChecker()
        );

        validator.addParamValidator(this.PARAM_HOST_ID, new StringChecker());
        validator.addParamValidator(
            this.PARAM_HOST_ID,
            new StringLengthChecker(1, 1)
        );

        validator.validate(this.requestBody);
        validator.validate(this.requestBody.locator || {});

        this.catalogLogic
            .create(this.requestBody)
            .then(createdHost => {
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
    protected updateRoute = (req: Request, res: Response, next: any): any => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new IntegerRangeChecker(1, null)
        );

        validator.addParamValidator(this.PARAM_TITLE, new StringChecker());
        validator.addParamValidator(
            this.PARAM_TITLE,
            new StringLengthChecker(1, 100)
        );

        validator.addParamValidator(this.PARAM_URL, new StringChecker());
        validator.addParamValidator(this.PARAM_URL, new UrlChecker());

        validator.addParamValidator(this.PARAM_LOCATOR, new ObjectChecker());

        validator.addParamValidator(this.PARAM_DETAIL_URL, new StringChecker());
        validator.addParamValidator(
            this.PARAM_PAGE_NUMBER,
            new StringChecker()
        );

        validator.addParamValidator(this.PARAM_HOST_ID, new IntegerChecker());
        validator.addParamValidator(
            this.PARAM_HOST_ID,
            new IntegerRangeChecker(1, null)
        );

        validator.validate(this.requestParams);
        validator.validate(this.requestBody);
        validator.validate(this.requestBody.locator || {});

        this.catalogLogic
            .update(this.requestParams.id, this.requestBody)
            .then((editedCatalog: object) => {
                this.sendResponse(
                    Constant.RESPONSE_STATUS_CODE.OK,
                    editedCatalog,
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
    protected deleteRoute = (req: Request, res: Response, next: any): any => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new IntegerChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new IntegerRangeChecker(1, null)
        );

        validator.validate(this.requestParams);

        this.catalogLogic
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

export default CatalogController;
