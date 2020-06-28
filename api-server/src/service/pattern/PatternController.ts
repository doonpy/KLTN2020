import { NextFunction, Response } from 'express-serve-static-core';
import ServiceControllerBase from '@service/ServiceControllerBase';
import {
    PatternMainLocator,
    PatternDocumentModel,
    PatternRequestBodySchema,
    PatternRequestParamSchema,
    PatternRequestQuerySchema,
    PatternPostDate,
    PatternSubLocator,
} from './interface';
import PatternLogic from './PatternLogic';
import Joi from '@hapi/joi';
import { CommonRequest } from '@service/interface';
import { createPatternViewFile } from '@service/pattern/helper';
import CommonConstant from '@common/constant';
import ResponseStatusCode from '@common/response-status-code';
import fs from 'fs';
import { getCryptoFilename } from '@util/file/file';

const commonPath = '/patterns';
const commonName = 'patterns';
const specifyIdPath = '/pattern/:id';
const specifyName = 'pattern';
const getPatternViewPath = '/get-pattern-view';
const patternReviewPath = '/pattern-review';

export default class PatternController extends ServiceControllerBase<
    PatternRequestParamSchema,
    PatternRequestQuerySchema,
    PatternRequestBodySchema
> {
    private static instance: PatternController;
    private readonly PARAM_SOURCE_URL = 'sourceUrl';

    constructor() {
        super(commonName, specifyName, PatternLogic.getInstance());
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
        this.router.get(
            this.commonPath + getPatternViewPath,
            this.initRequestLocalVariables.bind(this),
            this.getInputFromRequest.bind(this),
            this.validateInput.bind(this),
            this.getPatternViewPrepend.bind(this),
            this.getPatternView.bind(this)
        );
        this.router
            .all(
                this.commonPath + patternReviewPath,
                this.initRequestLocalVariables.bind(this),
                this.getInputFromRequest.bind(this)
            )
            .post(
                this.commonPath + patternReviewPath,
                this.postPatternReviewPrepend.bind(this),
                this.postPatternReview.bind(this),
                this.sendResponse.bind(this)
            );
    }

    public static getInstance(): PatternController {
        if (!this.instance) {
            this.instance = new PatternController();
        }

        return this.instance;
    }

    protected initValidateSchema(): void {
        this.reqQuerySchema = this.reqQuerySchema.keys({
            sourceUrl: Joi.string(),
            id: Joi.number().integer().min(CommonConstant.MIN_ID),
            filePath: Joi.string(),
        });

        this.reqBodySchema = this.reqBodySchema.keys({
            sourceUrl: Joi.string()
                .regex(/:\/\/[0-9a-z-.]+\.[a-z]+(\/.*)?/i)
                .uri({
                    scheme: [/https?/],
                }),
            mainLocator: Joi.object<PatternMainLocator>({
                propertyType: Joi.string(),
                title: Joi.string(),
                describe: Joi.string(),
                price: Joi.string(),
                acreage: Joi.string(),
                address: Joi.string(),
                postDate: Joi.object<PatternPostDate>({
                    locator: Joi.string(),
                    format: Joi.string(),
                    delimiter: Joi.string(),
                }),
            }),
            subLocator: Joi.array().items(
                Joi.object<PatternSubLocator>({
                    name: Joi.string(),
                    value: Joi.string(),
                })
            ),
        });
    }

    protected setRequiredInputForValidateSchema(): void {
        this.reqBodySchema = this.reqBodySchema.append({
            sourceUrl: Joi.required(),
            mainLocator: Joi.object<PatternMainLocator>({
                propertyType: Joi.required(),
                title: Joi.required(),
                describe: Joi.required(),
                price: Joi.required(),
                acreage: Joi.required(),
                address: Joi.required(),
                postDate: Joi.object<PatternPostDate>({
                    locator: Joi.required(),
                    format: Joi.required(),
                    delimiter: Joi.required(),
                }),
            }),
            subLocator: Joi.array().items(
                Joi.object<PatternSubLocator>({
                    name: Joi.required(),
                    value: Joi.required(),
                })
            ),
        });
    }

    protected getAllPrepend(
        req: CommonRequest<
            PatternRequestParamSchema,
            PatternRequestBodySchema,
            PatternRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.getConditions = this.buildQueryConditions([
            { paramName: this.PARAM_SOURCE_URL, isString: true },
        ]);
        next();
    }

    protected createPrepend(
        req: CommonRequest<
            PatternRequestParamSchema,
            PatternRequestBodySchema,
            PatternRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.validateNotExist = [{ sourceUrl: this.reqBody.sourceUrl }];
        next();
    }

    protected async updatePrepend(
        req: CommonRequest<
            PatternRequestParamSchema,
            PatternRequestBodySchema,
            PatternRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentPattern = (await this.logicInstance.getById(
                Number(this.reqParam.id)
            )) as PatternDocumentModel;
            if (
                currentPattern &&
                currentPattern.sourceUrl !== this.reqBody.sourceUrl
            ) {
                req.locals!.validateNotExist = [
                    { sourceUrl: this.reqBody.sourceUrl },
                ];
            }
            next();
        } catch (error) {
            next(error);
        }
    }

    private async getPatternViewPrepend(
        req: CommonRequest<
            PatternRequestParamSchema,
            PatternRequestBodySchema,
            PatternRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            await this.logicInstance.checkExisted({
                _id: Number(this.reqQuery.id),
            });
            const pattern = await this.logicInstance.getById(
                Number(this.reqQuery.id)
            );

            if (pattern) {
                req.locals!.pattern = pattern;
            }

            next();
        } catch (error) {
            next(error);
        }
    }

    private async getPatternView(
        req: CommonRequest<
            PatternRequestParamSchema,
            PatternRequestBodySchema,
            PatternRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const pattern = req.locals!.pattern as PatternDocumentModel;
            const reviewFolder = process.env.REVIEW_FOLDER!;
            const filename = getCryptoFilename(pattern.sourceUrl);
            if (!fs.existsSync(`${reviewFolder}/${filename}`)) {
                await createPatternViewFile(
                    pattern.sourceUrl,
                    pattern.mainLocator,
                    pattern.subLocator
                );
            }
            res.redirect(`${CommonConstant.REVIEW_FOLDER_PATH}/${filename}`);
        } catch (error) {
            next(error);
        }
    }

    private postPatternReviewPrepend(
        req: CommonRequest<
            PatternRequestParamSchema,
            PatternRequestBodySchema,
            PatternRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): void {
        req.locals!.sourceUrl = this.reqBody.sourceUrl;
        req.locals!.mainLocator = this.reqBody.mainLocator;
        req.locals!.subLocator = this.reqBody.subLocator;
        next();
    }

    private async postPatternReview(
        req: CommonRequest<
            PatternRequestParamSchema,
            PatternRequestBodySchema,
            PatternRequestQuerySchema
        >,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const filename = getCryptoFilename(req.locals!.sourceUrl);
            await createPatternViewFile(
                req.locals!.sourceUrl,
                req.locals!.mainLocator,
                req.locals!.subLocator
            );

            req.locals!.statusCode = ResponseStatusCode.OK;
            req.locals!.responseBody = {
                filePath: `${CommonConstant.REVIEW_FOLDER_PATH}/${filename}`,
            };
            next();
        } catch (error) {
            next(error);
        }
    }
}
