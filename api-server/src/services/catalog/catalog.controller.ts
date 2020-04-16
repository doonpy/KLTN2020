import { NextFunction, Request, Response } from 'express';
import ControllerBase from '../controller.base';
import CatalogLogic from './catalog.logic';
import Validator from '../../util/validator/validator';
import Checker from '../../util/checker/checker.index';
import CatalogModelInterface from './catalog.model.interface';
import ResponseStatusCode from '../../common/common.response-status.code';

const commonPath = '/catalogs';
const specifyIdPath = '/catalogs/:id';

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
    protected getAllRoute = (req: Request, res: Response, next: NextFunction): void => {
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
            .getAll((this.requestQuery[this.PARAM_HOST_ID] as unknown) as number, this.keyword, this.limit, this.offset)
            .then(({ catalogs, hasNext }): void => {
                const catalogList: object[] = catalogs.map((catalog: CatalogModelInterface): object => {
                    return CatalogLogic.convertToResponse(catalog);
                });

                const responseBody: object = {
                    catalogs: catalogList,
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

        this.catalogLogic
            .getById(this.requestParams[this.PARAM_ID])
            .then((catalog: CatalogModelInterface | null): void => {
                let responseBody: object = {};
                if (catalog) {
                    responseBody = {
                        catalog: CatalogLogic.convertToResponse(catalog),
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

        validator.validate((this.requestBody as unknown) as string);
        validator.validate((this.requestBody.locator as unknown) as { [key: string]: string });

        this.catalogLogic
            .create((this.requestBody as unknown) as CatalogModelInterface)
            .then((createdCatalog: CatalogModelInterface): void => {
                ControllerBase.sendResponse(
                    ResponseStatusCode.CREATED,
                    CatalogLogic.convertToResponse(createdCatalog),
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
        validator.validate((this.requestBody as unknown) as string);
        validator.validate((this.requestBody.locator as unknown) as { [key: string]: string });

        this.catalogLogic
            .update(this.requestParams[this.PARAM_ID], (this.requestBody as unknown) as CatalogModelInterface)
            .then((editedCatalog: CatalogModelInterface | undefined): void => {
                if (editedCatalog) {
                    ControllerBase.sendResponse(
                        ResponseStatusCode.OK,
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
    protected deleteRoute = (req: Request, res: Response, next: NextFunction): void => {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.catalogLogic
            .delete(this.requestParams[this.PARAM_ID])
            .then((): void => {
                ControllerBase.sendResponse(ResponseStatusCode.NO_CONTENT, {}, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    };
}
