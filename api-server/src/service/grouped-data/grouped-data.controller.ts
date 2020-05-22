import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '../../common/service/common.service.controller.base';
import GroupedDataLogic from './grouped-data.logic';
import Validator from '../../util/validator/validator';
import Checker from '../../util/checker/checker.index';
import { GroupedDataApiModel, GroupedDataDocumentModel } from './grouped-data.interface';
import ResponseStatusCode from '../../common/common.response-status.code';
import RawDataLogic from '../raw-data/raw-data.logic';

const commonPath = '/grouped-dataset';
const specifyIdPath = '/grouped-data/:id';

export default class GroupedDataController extends CommonServiceControllerBase {
    private static instance: GroupedDataController;

    private groupedDataLogic: GroupedDataLogic = new GroupedDataLogic();

    private readonly PARAM_ITEMS: string = 'items';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * @return {GroupedDataController}
     */
    public static getInstance(): GroupedDataController {
        if (!this.instance) {
            this.instance = new GroupedDataController();
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

            let items: string[];
            if (!Array.isArray(this.requestQuery[this.PARAM_ITEMS])) {
                items = [this.requestQuery[this.PARAM_ITEMS] as string];
            } else {
                items = this.requestQuery[this.PARAM_ITEMS] as string[];
                items.forEach((item, index): void => {
                    this.validator.addParamValidator(index.toString(), new Checker.Type.Integer());
                    this.validator.addParamValidator(index.toString(), new Checker.IntegerRange(1, null));
                });
            }

            this.validator.validate(items as string[]);

            const {
                documents,
                hasNext,
            }: { documents: GroupedDataDocumentModel[]; hasNext: boolean } = await this.groupedDataLogic.getAll(
                this.limit,
                this.offset,
                this.buildQueryConditions([{ paramName: this.PARAM_ITEMS, isString: false }]),
                this.populate
            );
            const groupedDataList: GroupedDataApiModel[] = documents.map(
                (groupedData: GroupedDataDocumentModel): GroupedDataApiModel =>
                    this.groupedDataLogic.convertToApiResponse(groupedData)
            );
            const responseBody: object = {
                groupedDataset: groupedDataList,
                hasNext,
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
    protected async getWithIdRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
            this.validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

            this.validator.validate(this.requestParams);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            await this.groupedDataLogic.checkExistsWithId(idBody);
            const groupedData: GroupedDataDocumentModel = await this.groupedDataLogic.getById(idBody, true);
            const responseBody: object = {
                groupedData: this.groupedDataLogic.convertToApiResponse(groupedData),
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

            this.validator.addParamValidator(this.PARAM_ITEMS, new Checker.Type.Array());

            this.validator.validate(this.requestBody);

            const groupedDataBody: GroupedDataDocumentModel = (this.requestBody as unknown) as GroupedDataDocumentModel;
            for (const item of groupedDataBody.items) {
                await RawDataLogic.getInstance().checkExistsWithId(item);
            }
            const createdGroupedData: GroupedDataDocumentModel = await this.groupedDataLogic.create(
                groupedDataBody,
                true
            );

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.CREATED,
                this.groupedDataLogic.convertToApiResponse(createdGroupedData),
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

            this.validator.addParamValidator(this.PARAM_ITEMS, new Checker.Type.Array());

            this.validator.validate(this.requestParams);
            this.validator.validate(this.requestBody);

            const idBody = Number(this.requestParams[this.PARAM_ID]);
            const groupedDataBody: GroupedDataDocumentModel = (this.requestBody as unknown) as GroupedDataDocumentModel;
            await this.groupedDataLogic.checkExistsWithId(idBody);
            for (const item of groupedDataBody.items) {
                await RawDataLogic.getInstance().checkExistsWithId(item);
            }
            const editedGroupedData: GroupedDataDocumentModel = await this.groupedDataLogic.update(
                idBody,
                groupedDataBody,
                true
            );

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                this.groupedDataLogic.convertToApiResponse(editedGroupedData),
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
            await this.groupedDataLogic.checkExistsWithId(idBody);
            await this.groupedDataLogic.delete(idBody);

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.NO_CONTENT, {}, res);
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
