import { Request, Response } from 'express';
import ControllerBase from '../base/controller.base';
import CatalogLogic from './catalog.logic';
import { Constant } from '../../util/definition/constant';
import Validator from '../validator/validator';
import StringChecker from '../checker/type/string.checker';
import StringLengthChecker from '../checker/string-length.checker';
import UrlChecker from '../checker/url.checker';
import ObjectChecker from '../checker/type/object.checker';

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

        validator.validate(req.query);
        validator.validate(req.body);

        this.initInputs(req);

        this.catalogLogic
            .getAll()
            .then(catalogs => {
                let handledCatalogs: Array<object> = this.handleItemsList(
                    catalogs
                );
                let responseBody: object = {
                    catalogs: handledCatalogs,
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
    ): any => {
        const validator = new Validator();
        validator.addParamValidator(this.PARAM_ID, new StringChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new StringLengthChecker(24, 24)
        );

        validator.validate(req.params);

        this.initInputs(req);

        this.catalogLogic
            .getById(req.params.id)
            .then(catalog => {
                let responseBody: object = {
                    catalog: catalog,
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
            new StringLengthChecker(24, 24)
        );

        validator.validate(req.body);
        validator.validate(req.body.locator || {});

        this.initInputs(req);

        this.catalogLogic
            .create(req.body)
            .then(createdHost => {
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
     */
    protected updateRoute = (req: Request, res: Response, next: any): any => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new StringChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new StringLengthChecker(24, 24)
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

        validator.addParamValidator(this.PARAM_HOST_ID, new StringChecker());
        validator.addParamValidator(
            this.PARAM_HOST_ID,
            new StringLengthChecker(24, 24)
        );

        validator.validate(req.params);
        validator.validate(req.body);
        validator.validate(req.body.locator || {});

        this.initInputs(req);

        this.catalogLogic
            .update(req.params.id, this.requestBody)
            .then((editedCatalog: object) => {
                this.apiResponse.sendResponse(
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

        validator.addParamValidator(this.PARAM_ID, new StringChecker());
        validator.addParamValidator(
            this.PARAM_ID,
            new StringLengthChecker(24, 24)
        );

        validator.validate(req.params);

        this.catalogLogic
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

export default CatalogController;
