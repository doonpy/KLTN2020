import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '../../common/service/common.service.controller.base';
import PatternLogic from './pattern.logic';
import Validator from '../../util/validator/validator';
import Checker from '../../util/checker/checker.index';
import { PatternApiModel, PatternDocumentModel } from './pattern.interface';
import ResponseStatusCode from '../../common/common.response-status.code';

const commonPath = '/patterns';
const specifyIdPath = '/patterns/:id';

export default class PatternController extends CommonServiceControllerBase {
    private static instance: PatternController;

    private patternLogic: PatternLogic = PatternLogic.getInstance();

    private readonly PARAM_SOURCE_URL: string = 'sourceUrl';

    private readonly PARAM_MAIN_LOCATOR: string = 'mainLocator';

    private readonly PARAM_SUB_LOCATOR: string = 'subLocator';

    private readonly PARAM_TITLE_LOCATOR: string = 'title';

    private readonly PARAM_DESCRIBE_LOCATOR: string = 'describe';

    private readonly PARAM_PRICE_LOCATOR: string = 'price';

    private readonly PARAM_ACREAGE_LOCATOR: string = 'acreage';

    private readonly PARAM_ADDRESS_LOCATOR: string = 'address';

    private readonly PARAM_PROPERTY_TYPE_LOCATOR: string = 'propertyType';

    private readonly PARAM_POST_DATE_LOCATOR: string = 'postDate';

    private readonly PARAM_NAME_SUB_LOCATOR: string = 'name';

    private readonly PARAM_LOCATOR_SUB_LOCATOR: string = 'locator';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * @return {PatternController}
     */
    public static getInstance(): PatternController {
        if (!this.instance) {
            this.instance = new PatternController();
        }

        return this.instance;
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getAllRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.requestQuery[this.PARAM_SOURCE_URL] as string,
                new Checker.Type.String()
            );

            this.validator.validate(this.requestQuery);

            const {
                documents,
                hasNext,
            }: { documents: PatternDocumentModel[]; hasNext: boolean } = await this.patternLogic.getAll(
                this.limit,
                this.offset,
                this.buildQueryConditions([{ paramName: this.PARAM_SOURCE_URL, isString: true }]),
                this.populate
            );
            const patterns: object[] = documents.map(
                (pattern): PatternApiModel => this.patternLogic.convertToApiResponse(pattern)
            );

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                {
                    patterns,
                    hasNext,
                },
                res
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getWithIdRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            await this.patternLogic.checkExistsWithId(idBody);
            const pattern: PatternDocumentModel = await this.patternLogic.getById(idBody);
            const responseBody: object = {
                pattern: this.patternLogic.convertToApiResponse(pattern),
            };

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_SOURCE_URL, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_SOURCE_URL, new Checker.Url());

            this.validator.addParamValidator(this.PARAM_MAIN_LOCATOR, new Checker.Type.Object());

            this.validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_DESCRIBE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_DESCRIBE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_PROPERTY_TYPE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_PROPERTY_TYPE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_POST_DATE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_POST_DATE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_SUB_LOCATOR, new Checker.Type.Object());

            this.validator.addParamValidator(this.PARAM_LOCATOR_SUB_LOCATOR, new Checker.Type.String());

            this.validator.addParamValidator(this.PARAM_NAME_SUB_LOCATOR, new Checker.Type.String());

            this.validator.validate(this.requestBody);

            const patternBody: PatternDocumentModel = (this.requestBody as unknown) as PatternDocumentModel;
            await this.patternLogic.checkExistsWithSourceUrl(patternBody.sourceUrl, true);
            const createdPattern: PatternDocumentModel = await this.patternLogic.create(patternBody);

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.CREATED,
                this.patternLogic.convertToApiResponse(createdPattern),
                res
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.validator.addParamValidator(this.PARAM_SOURCE_URL, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_SOURCE_URL, new Checker.Url());

            this.validator.addParamValidator(this.PARAM_MAIN_LOCATOR, new Checker.Type.Object());

            this.validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_TITLE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_DESCRIBE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_DESCRIBE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_PRICE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_ACREAGE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_ADDRESS_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_PROPERTY_TYPE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_PROPERTY_TYPE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_POST_DATE_LOCATOR, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_POST_DATE_LOCATOR, new Checker.StringLength(1, null));

            this.validator.addParamValidator(this.PARAM_SUB_LOCATOR, new Checker.Type.Object());

            this.validator.addParamValidator(this.PARAM_LOCATOR_SUB_LOCATOR, new Checker.Type.String());

            this.validator.addParamValidator(this.PARAM_NAME_SUB_LOCATOR, new Checker.Type.String());

            this.validator.validate(this.requestParams);
            this.validator.validate(this.requestBody);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const patternBody: PatternDocumentModel = (this.requestBody as unknown) as PatternDocumentModel;
            await this.patternLogic.checkExistsWithId(idBody);
            const currentPattern: PatternDocumentModel = await this.patternLogic.getById(idBody);
            if (patternBody.sourceUrl !== currentPattern.sourceUrl) {
                await this.patternLogic.checkExistsWithSourceUrl(patternBody.sourceUrl, true);
            }
            const editedPattern: PatternDocumentModel = await this.patternLogic.update(idBody, patternBody);

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                this.patternLogic.convertToApiResponse(editedPattern),
                res
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            await this.patternLogic.checkExistsWithId(idBody);
            await this.patternLogic.delete(idBody);

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.NO_CONTENT, {}, res);
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
