import { NextFunction, Request, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import Validator from '@util/validator/Validator';
import Checker from '@util/checker';
import ResponseStatusCode from '@common/response-status-code';
import { PatternDocumentModel } from './interface';
import PatternLogic from './PatternLogic';

const commonPath = '/patterns';
const specifyIdPath = '/pattern/:id';

export default class PatternController extends ServiceControllerBase {
    private static instance: PatternController;

    private patternLogic = PatternLogic.getInstance();

    private readonly PARAM_SOURCE_URL = 'sourceUrl';

    private readonly PARAM_MAIN_LOCATOR = 'mainLocator';

    private readonly PARAM_SUB_LOCATOR = 'subLocator';

    private readonly PARAM_TITLE_LOCATOR = 'title';

    private readonly PARAM_DESCRIBE_LOCATOR = 'describe';

    private readonly PARAM_PRICE_LOCATOR = 'price';

    private readonly PARAM_ACREAGE_LOCATOR = 'acreage';

    private readonly PARAM_ADDRESS_LOCATOR = 'address';

    private readonly PARAM_PROPERTY_TYPE_LOCATOR = 'propertyType';

    private readonly PARAM_POST_DATE_LOCATOR = 'postDate';

    private readonly PARAM_NAME_SUB_LOCATOR = 'name';

    private readonly PARAM_VALUE_SUB_LOCATOR = 'value';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    public static getInstance(): PatternController {
        if (!this.instance) {
            this.instance = new PatternController();
        }

        return this.instance;
    }

    protected async getAllRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.requestQuery[this.PARAM_SOURCE_URL] as string,
                new Checker.Type.String()
            );

            this.validator.validate(this.requestQuery);

            const { documents, hasNext } = await this.patternLogic.getAll({
                limit: this.limit,
                offset: this.offset,
                conditions: this.buildQueryConditions([
                    { paramName: this.PARAM_SOURCE_URL, isString: true },
                ]),
            });
            const patterns = documents.map((pattern) =>
                this.patternLogic.convertToApiResponse(pattern)
            );

            ServiceControllerBase.sendResponse(res, ResponseStatusCode.OK, {
                patterns,
                hasNext,
            });
        } catch (error) {
            next(this.createServiceError(error, this.language));
        }
    }

    protected async getByIdRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const pattern = await this.patternLogic.getById(idBody);
            const responseBody = {
                pattern: this.patternLogic.convertToApiResponse(pattern!),
            };

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                responseBody
            );
        } catch (error) {
            next(this.createServiceError(error, this.language));
        }
    }

    protected async createRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_SOURCE_URL,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_SOURCE_URL,
                new Checker.Url()
            );

            this.validator.addParamValidator(
                this.PARAM_MAIN_LOCATOR,
                new Checker.Type.Object()
            );

            this.validator.addParamValidator(
                this.PARAM_TITLE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_TITLE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_DESCRIBE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_DESCRIBE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_PRICE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_PRICE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_ACREAGE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_ACREAGE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_ADDRESS_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_ADDRESS_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_POST_DATE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_POST_DATE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_SUB_LOCATOR,
                new Checker.Type.Object()
            );

            this.validator.addParamValidator(
                this.PARAM_VALUE_SUB_LOCATOR,
                new Checker.Type.String()
            );

            this.validator.addParamValidator(
                this.PARAM_NAME_SUB_LOCATOR,
                new Checker.Type.String()
            );

            this.validator.validate(this.requestBody);

            const patternBody = (this
                .requestBody as unknown) as PatternDocumentModel;
            const createdPattern = await this.patternLogic.create(patternBody, {
                notExist: { [this.PARAM_SOURCE_URL]: patternBody.sourceUrl },
            });

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.CREATED,
                this.patternLogic.convertToApiResponse(createdPattern)
            );
        } catch (error) {
            next(this.createServiceError(error, this.language));
        }
    }

    protected async updateRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_SOURCE_URL,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_SOURCE_URL,
                new Checker.Url()
            );

            this.validator.addParamValidator(
                this.PARAM_MAIN_LOCATOR,
                new Checker.Type.Object()
            );

            this.validator.addParamValidator(
                this.PARAM_TITLE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_TITLE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_DESCRIBE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_DESCRIBE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_PRICE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_PRICE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_ACREAGE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_ACREAGE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_ADDRESS_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_ADDRESS_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_POST_DATE_LOCATOR,
                new Checker.Type.String()
            );
            this.validator.addParamValidator(
                this.PARAM_POST_DATE_LOCATOR,
                new Checker.StringLength(1, null)
            );

            this.validator.addParamValidator(
                this.PARAM_SUB_LOCATOR,
                new Checker.Type.Object()
            );

            this.validator.addParamValidator(
                this.PARAM_VALUE_SUB_LOCATOR,
                new Checker.Type.String()
            );

            this.validator.addParamValidator(
                this.PARAM_NAME_SUB_LOCATOR,
                new Checker.Type.String()
            );

            this.validator.validate(this.requestParams);
            this.validator.validate(this.requestBody);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const patternBody = (this
                .requestBody as unknown) as PatternDocumentModel;
            const currentPattern = await this.patternLogic.getById(idBody);
            let editedPattern: PatternDocumentModel;
            if (patternBody.sourceUrl !== currentPattern!.sourceUrl) {
                editedPattern = await this.patternLogic.update(
                    idBody,
                    patternBody,
                    {
                        notExist: {
                            [this.PARAM_SOURCE_URL]: patternBody.sourceUrl,
                        },
                    }
                );
            } else {
                editedPattern = await this.patternLogic.update(
                    idBody,
                    patternBody
                );
            }

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                this.patternLogic.convertToApiResponse(editedPattern)
            );
        } catch (error) {
            next(this.createServiceError(error, this.language));
        }
    }

    protected async deleteRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_ID,
                new Checker.IntegerRange(1, null)
            );

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            await this.patternLogic.delete(idBody);

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.NO_CONTENT,
                {}
            );
        } catch (error) {
            next(this.createServiceError(error, this.language));
        }
    }

    protected async getDocumentAmount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const documentAmount = await this.patternLogic.getDocumentAmount();

            ServiceControllerBase.sendResponse(res, ResponseStatusCode.OK, {
                schema: 'pattern',
                documentAmount,
            });
        } catch (error) {
            next(this.createServiceError(error, this.language));
        }
    }
}
