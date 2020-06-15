import { NextFunction, Request, Response } from 'express';
import ServiceControllerBase from '@service/ServiceControllerBase';
import Validator from '@util/validator/Validator';
import Checker from '@util/checker';
import ResponseStatusCode from '@common/response-status-code';
import GroupedDataLogic from './GroupedDataLogic';
import { GroupedDataDocumentModel } from './interface';
import RawDataLogic from '../raw-data/RawDataLogic';

const commonPath = '/grouped-dataset';
const specifyIdPath = '/grouped-data/:id';

export default class GroupedDataController extends ServiceControllerBase {
    private static instance: GroupedDataController;

    private groupedDataLogic = new GroupedDataLogic();

    private readonly PARAM_ITEMS = 'items';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    public static getInstance(): GroupedDataController {
        if (!this.instance) {
            this.instance = new GroupedDataController();
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

            let items: string[];
            if (!Array.isArray(this.requestQuery[this.PARAM_ITEMS])) {
                items = [this.requestQuery[this.PARAM_ITEMS] as string];
            } else {
                items = this.requestQuery[this.PARAM_ITEMS] as string[];
                items.forEach((item, index): void => {
                    this.validator.addParamValidator(
                        index.toString(),
                        new Checker.Type.Integer()
                    );
                    this.validator.addParamValidator(
                        index.toString(),
                        new Checker.IntegerRange(1, null)
                    );
                });
            }

            this.validator.validate(items as string[]);

            const { documents, hasNext } = await this.groupedDataLogic.getAll({
                limit: this.limit,
                offset: this.offset,
                conditions: this.buildQueryConditions([
                    { paramName: this.PARAM_ITEMS, isString: false },
                ]),
            });
            const groupedDataList = documents.map(
                (groupedData: GroupedDataDocumentModel) =>
                    this.groupedDataLogic.convertToApiResponse(groupedData)
            );
            const responseBody = {
                groupedDataset: groupedDataList,
                hasNext,
            };

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                responseBody
            );
        } catch (error) {
            next(this.createError(error, this.language));
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
            const groupedData = await this.groupedDataLogic.getById(idBody);
            const responseBody = {
                groupedData: this.groupedDataLogic.convertToApiResponse(
                    groupedData
                ),
            };

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                responseBody
            );
        } catch (error) {
            next(this.createError(error, this.language));
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
                this.PARAM_ITEMS,
                new Checker.Type.Array()
            );

            this.validator.validate(this.requestBody);

            const groupedDataBody = (this
                .requestBody as unknown) as GroupedDataDocumentModel;
            for (const item of groupedDataBody.items) {
                await RawDataLogic.getInstance().checkExisted({
                    [this.PARAM_DOCUMENT_ID]: item,
                });
            }
            const createdGroupedData = await this.groupedDataLogic.create(
                groupedDataBody
            );

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.CREATED,
                this.groupedDataLogic.convertToApiResponse(createdGroupedData)
            );
        } catch (error) {
            next(this.createError(error, this.language));
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
                this.PARAM_ITEMS,
                new Checker.Type.Array()
            );

            this.validator.validate(this.requestParams);
            this.validator.validate(this.requestBody);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const groupedDataBody = (this
                .requestBody as unknown) as GroupedDataDocumentModel;
            for (const item of groupedDataBody.items) {
                await RawDataLogic.getInstance().checkExisted({
                    [this.PARAM_DOCUMENT_ID]: item,
                });
            }
            const editedGroupedData = await this.groupedDataLogic.update(
                idBody,
                groupedDataBody,
                [{ [this.PARAM_DOCUMENT_ID]: idBody }]
            );

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.OK,
                this.groupedDataLogic.convertToApiResponse(editedGroupedData)
            );
        } catch (error) {
            next(this.createError(error, this.language));
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
            await this.groupedDataLogic.delete(idBody);

            ServiceControllerBase.sendResponse(
                res,
                ResponseStatusCode.NO_CONTENT,
                {}
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    protected async getDocumentAmount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const documentAmount = await this.groupedDataLogic.getDocumentAmount();

            ServiceControllerBase.sendResponse(res, ResponseStatusCode.OK, {
                schema: 'grouped-data',
                documentAmount,
            });
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
