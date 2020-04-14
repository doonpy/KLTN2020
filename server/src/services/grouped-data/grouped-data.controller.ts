import ControllerBase from '../controller.base';
import GroupedDataLogic from './grouped-data.logic';
import { Request, Response } from 'express';
import Validator from '../../util/validator/validator';
import { Checker } from '../../util/checker/checker.index';
import GroupedDataModelInterface from './grouped-data.model.interface';
import GroupedDataApiInterface from './grouped-data.api.interface';
import { ResponseStatusCode } from '../../common/common.response-status.code';

const commonPath: string = '/grouped-dataset';
const specifyIdPath: string = '/grouped-dataset/:id';

export default class GroupedDataController extends ControllerBase {
    private groupedDataLogic: GroupedDataLogic = new GroupedDataLogic();
    private readonly PARAM_ITEMS: string = 'items';

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

        validator.addParamValidator(this.PARAM_POPULATE, new Checker.Type.Boolean());

        validator.validate(this.requestQuery);

        this.groupedDataLogic
            .getAll(this.populate, this.limit, this.offset)
            .then(({ groupedDataset, hasNext }): void => {
                const groupedDataList: GroupedDataApiInterface[] = groupedDataset.map(
                    (groupedData: GroupedDataModelInterface): GroupedDataApiInterface => {
                        return GroupedDataLogic.convertToResponse(groupedData);
                    }
                );

                const responseBody: object = {
                    groupedDataset: groupedDataList,
                    hasNext,
                };

                this.sendResponse(ResponseStatusCode.OK, responseBody, res);
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

        this.groupedDataLogic
            .getById(this.requestParams[this.PARAM_ID])
            .then((groupedData: GroupedDataModelInterface | null): void => {
                let responseBody: object = {};
                if (groupedData) {
                    responseBody = {
                        groupedData: GroupedDataLogic.convertToResponse(groupedData),
                    };
                }

                this.sendResponse(ResponseStatusCode.OK, responseBody, res);
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

        validator.addParamValidator(this.PARAM_ITEMS, new Checker.Type.Array());

        validator.validate(this.requestBody);

        this.groupedDataLogic
            .create(this.requestBody)
            .then((createdGroupedData: GroupedDataModelInterface): void => {
                this.sendResponse(
                    ResponseStatusCode.CREATED,
                    GroupedDataLogic.convertToResponse(createdGroupedData),
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

        validator.addParamValidator(this.PARAM_ITEMS, new Checker.Type.Array());

        validator.validate(this.requestParams);
        validator.validate(this.requestBody);

        this.groupedDataLogic
            .update(this.requestParams[this.PARAM_ID], this.requestBody)
            .then((editedGroupedData: GroupedDataModelInterface | undefined): void => {
                if (editedGroupedData) {
                    this.sendResponse(
                        ResponseStatusCode.OK,
                        GroupedDataLogic.convertToResponse(editedGroupedData, this.populate),
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

        this.groupedDataLogic
            .delete(this.requestParams[this.PARAM_ID])
            .then((): void => {
                this.sendResponse(ResponseStatusCode.NO_CONTENT, {}, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    };
}
