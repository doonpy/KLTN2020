import { Router } from 'express';
import {
    Response,
    Router as RouterType,
    NextFunction,
} from 'express-serve-static-core';
import ResponseStatusCode from '@common/response-status-code';
import {
    ApiModelBase,
    CommonRequest,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';
import ExceptionCustomize from '@util/exception/ExceptionCustomize';
import Wording from '@service/wording';
import Joi from '@hapi/joi';
import ServiceLogicBase from '@service/ServiceLogicBase';

enum ValidationType {
    PARAM,
    QUERY,
    BODY,
}

const documentAmountPath = '/document-amount';
const MIN_LIMIT = 1;
const MIN_ID = 1;
const MAX_LIMIT = 100;
const MIN_OFFSET = 0;

export default abstract class ServiceControllerBase<
    ReqParamSchema extends CommonRequestParamSchema = any,
    ReqQuerySchema extends CommonRequestQuerySchema = any,
    ReqBodySchema extends CommonRequestBodySchema = any
> {
    protected logicInstance!: ServiceLogicBase<DocumentModelBase, ApiModelBase>;
    protected commonPath = '';
    protected commonName = '';
    protected specifyIdPath = '';
    protected specifyName = '';
    protected limit!: number;
    protected offset!: number;
    protected reqParamSchema!: Joi.ObjectSchema<ReqParamSchema>;
    protected reqQuerySchema!: Joi.ObjectSchema<ReqQuerySchema>;
    protected reqBodySchema!: Joi.ObjectSchema<ReqBodySchema>;
    protected reqBody!: ReqBodySchema;
    protected reqParam!: ReqParamSchema;
    protected reqQuery!: ReqQuerySchema;
    public router: RouterType;
    protected readonly PARAM_DOCUMENT_ID = '_id';
    protected readonly PARAM_ID: string = 'id';

    protected constructor(
        commonName: string,
        specifyName: string,
        logicInstance: ServiceLogicBase<DocumentModelBase, ApiModelBase>
    ) {
        this.router = Router();
        this.logicInstance = logicInstance;
        this.commonName = commonName;
        this.specifyName = specifyName;
        this.initDefaultParamValidateSchema();
        this.initDefaultQueryValidateSchema();
        this.initDefaultBodyValidateSchema();
        this.initValidateSchema();
        // this.setRequiredInputForValidateSchema();
    }

    /**
     * Initialize REST API routes
     */
    protected initRoutes(): void {
        this.router
            .all<ReqParamSchema, ReqBodySchema, ReqBodySchema, ReqQuerySchema>(
                this.commonPath,
                this.initRequestLocalVariables.bind(this),
                this.getInputFromRequest.bind(this),
                this.validateInput.bind(this)
            )
            .get<ReqParamSchema, ReqBodySchema, ReqBodySchema, ReqQuerySchema>(
                this.commonPath,
                this.getAllPrepend.bind(this),
                this.getAllHandler.bind(this),
                this.sendResponse.bind(this)
            )
            .post<ReqParamSchema, ReqBodySchema, ReqBodySchema, ReqQuerySchema>(
                this.commonPath,
                this.createPrepend.bind(this),
                this.createHandler.bind(this),
                this.sendResponse.bind(this)
            );

        this.router
            .all<ReqParamSchema, ReqBodySchema, ReqBodySchema, ReqQuerySchema>(
                this.specifyIdPath,
                this.initRequestLocalVariables.bind(this),
                this.getInputFromRequest.bind(this),
                this.validateInput.bind(this)
            )
            .get<ReqParamSchema, ReqBodySchema, ReqBodySchema, ReqQuerySchema>(
                this.specifyIdPath,
                this.getByIdPrepend.bind(this),
                this.getByIdHandler.bind(this),
                this.sendResponse.bind(this)
            )
            .patch<
                ReqParamSchema,
                ReqBodySchema,
                ReqBodySchema,
                ReqQuerySchema
            >(
                this.specifyIdPath,
                this.updatePrepend.bind(this),
                this.updateHandler.bind(this),
                this.sendResponse.bind(this)
            )
            .delete<
                ReqParamSchema,
                ReqBodySchema,
                ReqBodySchema,
                ReqQuerySchema
            >(
                this.specifyIdPath,
                this.deletePrepend.bind(this),
                this.deleteHandler.bind(this),
                this.sendResponse.bind(this)
            );

        this.router
            .all<ReqParamSchema, ReqBodySchema, ReqBodySchema, ReqQuerySchema>(
                this.commonPath + documentAmountPath,
                this.initRequestLocalVariables.bind(this),
                this.getInputFromRequest.bind(this),
                this.validateInput.bind(this)
            )
            .get<ReqParamSchema, ReqBodySchema, ReqBodySchema, ReqQuerySchema>(
                this.commonPath + documentAmountPath,
                this.getDocumentAmountPrepend.bind(this),
                this.getDocumentAmountHandler.bind(this),
                this.sendResponse.bind(this)
            );
    }

    protected sendResponse(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): void {
        const statusCode =
            req.locals!.statusCode ?? ResponseStatusCode.INTERNAL_SERVER_ERROR;
        const body = req.locals!.responseBody ?? {};
        body.statusCode = statusCode;
        if (statusCode === ResponseStatusCode.NO_CONTENT) {
            res.status(ResponseStatusCode.OK).json(body);
        } else {
            res.status(ResponseStatusCode.OK).json(body);
        }
    }

    protected initRequestLocalVariables(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): void {
        req.locals = {};
        next();
    }

    protected getAllPrepend(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): void | Promise<void> {
        next();
    }

    protected async getAllHandler(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { documents, hasNext } = await this.logicInstance.getAll({
                limit: this.limit,
                offset: this.offset,
                conditions: req.locals!.getConditions,
            });
            const responseBody = {
                [this.commonName]: documents.map((document) =>
                    this.logicInstance.convertToApiResponse(document)
                ),
                hasNext,
            };

            req.locals!.statusCode = ResponseStatusCode.OK;
            req.locals!.responseBody = responseBody;
            next();
        } catch (error) {
            next(error);
        }
    }

    protected getByIdPrepend(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): void | Promise<void> {
        next();
    }

    protected async getByIdHandler(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = Number(this.reqParam[this.PARAM_ID]);
            await this.logicInstance.checkExisted({
                [this.PARAM_DOCUMENT_ID]: id,
            });
            const document = await this.logicInstance.getById(id);
            const responseBody = {
                [this.specifyName]: this.logicInstance.convertToApiResponse(
                    document!
                ),
            };

            req.locals!.statusCode = ResponseStatusCode.OK;
            req.locals!.responseBody = responseBody;
            next();
        } catch (error) {
            next(error);
        }
    }

    protected createPrepend(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): void | Promise<void> {
        next();
    }

    protected async createHandler(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const createdDocument = await this.logicInstance.create(
                this.reqBody,
                {
                    exist: req.locals!.validateExist,
                    notExist: req.locals!.validateNotExist,
                }
            );
            const responseBody = this.logicInstance.convertToApiResponse(
                createdDocument
            );

            req.locals!.statusCode = ResponseStatusCode.CREATED;
            req.locals!.responseBody = responseBody;
            next();
        } catch (error) {
            next(error);
        }
    }

    protected updatePrepend(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): void | Promise<void> {
        next();
    }

    protected async updateHandler(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = Number(this.reqParam[this.PARAM_ID]);
            const editedDocument = await this.logicInstance.update(
                id,
                this.reqBody,
                {
                    exist: req.locals!.validateExist,
                    notExist: req.locals!.validateNotExist,
                }
            );
            const responseBody = this.logicInstance.convertToApiResponse(
                editedDocument
            );

            req.locals!.statusCode = ResponseStatusCode.OK;
            req.locals!.responseBody = responseBody;
            next();
        } catch (error) {
            next(error);
        }
    }

    protected deletePrepend(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): void | Promise<void> {
        next();
    }

    protected async deleteHandler(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = Number(this.reqParam[this.PARAM_ID]);
            await this.logicInstance.checkExisted({
                [this.PARAM_DOCUMENT_ID]: id,
            });
            await this.logicInstance.delete(id);

            req.locals!.statusCode = ResponseStatusCode.NO_CONTENT;
            next();
        } catch (error) {
            next(error);
        }
    }

    protected getDocumentAmountPrepend(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): void | Promise<void> {
        next();
    }

    protected async getDocumentAmountHandler(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const documentAmount = await this.logicInstance.getDocumentAmount(
                req.locals!.getConditions
            );
            const responseBody = { documentAmount };

            req.locals!.statusCode = ResponseStatusCode.OK;
            req.locals!.responseBody = responseBody;
            next();
        } catch (error) {
            next(error);
        }
    }

    protected initValidateSchema(): void {
        return undefined;
    }

    protected setRequiredInputForValidateSchema(): void {
        return undefined;
    }

    private initDefaultQueryValidateSchema(): void {
        this.reqQuerySchema = Joi.object<ReqQuerySchema>({
            limit: Joi.number().integer().min(MIN_LIMIT).max(MAX_LIMIT),
            offset: Joi.number().integer().min(MIN_OFFSET),
        });
    }

    private initDefaultParamValidateSchema(): void {
        this.reqParamSchema = Joi.object<ReqParamSchema>({
            id: Joi.number().integer().min(MIN_ID),
        });
    }

    private initDefaultBodyValidateSchema(): void {
        this.reqBodySchema = Joi.object<ReqBodySchema>({
            id: Joi.alternatives(Joi.number().integer().min(MIN_ID), Joi.any()),
            createAt: Joi.alternatives(Joi.date().iso(), Joi.any()),
            updateAt: Joi.alternatives(Joi.date().iso(), Joi.any()),
        });
    }

    private validateLogic(validationType: ValidationType): void {
        let error: Joi.ValidationError | undefined;
        switch (validationType) {
            case ValidationType.BODY:
                if (!this.reqBodySchema) break;
                error = this.reqBodySchema.validate(this.reqBody)?.error;
                break;

            case ValidationType.PARAM:
                if (!this.reqParamSchema) break;
                error = this.reqParamSchema.validate(this.reqParam)?.error;
                break;

            case ValidationType.QUERY:
                if (!this.reqQuerySchema) break;
                error = this.reqQuerySchema.validate(this.reqQuery)?.error;
                break;
        }

        if (error) {
            const errorMessage = error.details
                .map(({ message }) => message)
                .join('. ');
            throw new ExceptionCustomize(
                ResponseStatusCode.BAD_REQUEST,
                Wording.CAUSE.CAU_CM_SER_4,
                errorMessage
            );
        }
    }

    protected validateInput(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): void {
        try {
            this.validateLogic(ValidationType.PARAM);
            this.validateLogic(ValidationType.QUERY);
            if (req.method === 'POST' || req.method === 'PATCH') {
                this.validateLogic(ValidationType.BODY);
            }
            next();
        } catch (error) {
            next(error);
        }
    }

    protected getInputFromRequest(
        req: CommonRequest<ReqParamSchema, ReqBodySchema, ReqQuerySchema>,
        res: Response,
        next: NextFunction
    ): void {
        this.reqParam = req.params ?? {};
        this.reqQuery = req.query ?? {};
        this.reqBody = req.body ?? {};
        this.limit = Number(this.reqQuery.limit) || MAX_LIMIT;
        this.offset = Number(this.reqQuery.offset) || MIN_OFFSET;

        next();
    }

    protected buildQueryConditions(
        queryParams: Array<{ paramName: string; isString: boolean }>
    ): Record<string, any> {
        const conditions: Record<string, any> = {};
        const cloneRequestQuery = this.reqQuery as Record<string, any>;

        Object.keys(cloneRequestQuery).forEach((key) => {
            const param = queryParams.find(
                ({ paramName }) => paramName === key
            );
            if (param) {
                if (param.isString) {
                    let pattern = '';
                    if (typeof cloneRequestQuery[key] !== 'string') {
                        cloneRequestQuery[key].forEach((v: any): void => {
                            pattern += `(?=.*${v}.*)`;
                        });
                    } else {
                        pattern = cloneRequestQuery[key];
                    }
                    conditions[key] = { $regex: RegExp(pattern, 'i') };
                } else {
                    conditions[key] = cloneRequestQuery[key];
                }
            }
        });

        return conditions;
    }
}
