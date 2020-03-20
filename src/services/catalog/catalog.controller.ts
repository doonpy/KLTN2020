import { Request, Response } from 'express';
import ControllerBase from '../controller.base';
import CatalogLogic from './catalog.logic';
import Validator from '../validator/validator';
import { Checker } from '../checker/checker.index';
import CatalogModelInterface from './catalog.model.interface';
import { Common } from '../../common/common.index';

const commonPath: string = '/catalogs';
const specifyIdPath: string = '/catalogs/:id';

export default class CatalogController extends ControllerBase {
    private catalogLogic: CatalogLogic = new CatalogLogic();
    private readonly PARAM_PATTERN_ID: string = 'patternId';
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
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_LIMIT, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_LIMIT, new Checker.IntegerRange(1, 1000));

        validator.addParamValidator(this.PARAM_OFFSET, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_OFFSET, new Checker.IntegerRange(0, null));

        validator.addParamValidator(this.PARAM_HOST_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_HOST_ID, new Checker.IntegerRange(1, null));

        validator.addParamValidator(this.PARAM_KEYWORD, new Checker.Type.String());

        validator.validate(this.requestQuery);

        this.catalogLogic
            .getAll(this.requestQuery[this.PARAM_HOST_ID], this.keyword, this.limit, this.offset)
            .then(({ catalogs, hasNext }): void => {
                let catalogList: Array<object> = catalogs.map(
                    (catalog: CatalogModelInterface): object => {
                        return CatalogLogic.convertToResponse(catalog);
                    }
                );

                let responseBody: object = {
                    catalogs: catalogList,
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
    protected getWithIdRoute = (req: Request, res: Response, next: any): any => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.catalogLogic
            .getById(this.requestParams[this.PARAM_ID])
            .then((catalog: CatalogModelInterface | null): void => {
                let responseBody: object = {};
                if (catalog) {
                    responseBody = {
                        catalog: CatalogLogic.convertToResponse(catalog),
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
    protected createRoute = (req: Request, res: Response, next: any): any => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_TITLE, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_TITLE, new Checker.StringLength(1, 100));

        validator.addParamValidator(this.PARAM_URL, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_URL, new Checker.StringLength(1, null));

        validator.addParamValidator(this.PARAM_LOCATOR, new Checker.Type.Object());

        validator.addParamValidator(this.PARAM_DETAIL_URL, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_PAGE_NUMBER, new Checker.Type.String());

        validator.addParamValidator(this.PARAM_HOST_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_HOST_ID, new Checker.IntegerRange(1, null));

        validator.addParamValidator(this.PARAM_PATTERN_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_PATTERN_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestBody);
        validator.validate(this.requestBody.locator || {});

        this.catalogLogic
            .create(this.requestBody)
            .then((createdHost: CatalogModelInterface): void => {
                this.sendResponse(
                    Common.ResponseStatusCode.CREATED,
                    CatalogLogic.convertToResponse(createdHost),
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

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.addParamValidator(this.PARAM_TITLE, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_TITLE, new Checker.StringLength(1, 100));

        validator.addParamValidator(this.PARAM_URL, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_URL, new Checker.Url());

        validator.addParamValidator(this.PARAM_LOCATOR, new Checker.Type.Object());

        validator.addParamValidator(this.PARAM_DETAIL_URL, new Checker.Type.String());
        validator.addParamValidator(this.PARAM_PAGE_NUMBER, new Checker.Type.String());

        validator.addParamValidator(this.PARAM_HOST_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_HOST_ID, new Checker.IntegerRange(1, null));

        validator.addParamValidator(this.PARAM_PATTERN_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_PATTERN_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);
        validator.validate(this.requestBody);
        validator.validate(this.requestBody.locator || {});

        this.catalogLogic
            .update(this.requestParams[this.PARAM_ID], this.requestBody)
            .then((editedCatalog: CatalogModelInterface | undefined): void => {
                if (editedCatalog) {
                    this.sendResponse(
                        Common.ResponseStatusCode.OK,
                        CatalogLogic.convertToResponse(editedCatalog),
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
    protected deleteRoute = (req: Request, res: Response, next: any): any => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.catalogLogic
            .delete(this.requestParams[this.PARAM_ID])
            .then((): void => {
                this.sendResponse(Common.ResponseStatusCode.NO_CONTENT, {}, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    };
}
