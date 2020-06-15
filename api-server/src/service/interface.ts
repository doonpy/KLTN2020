import { Document } from 'mongoose';
import { Router } from 'express';

export interface DocumentModelBase extends Document {
    cTime: string;
    mTime: string;
}

export interface ApiModelBase {
    id: number | null;
    createAt: string | null;
    updateAt: string | null;
}

export interface GetAllReturnData<DocumentModel extends DocumentModelBase> {
    documents: DocumentModel[];
    hasNext: boolean;
}

export interface CommonOptions {
    limit?: number;
    offset?: number;
    conditions?: object;
}

export interface CommonLogicBaseInterface<
    DocumentModel extends DocumentModelBase,
    ApiModel extends ApiModelBase
> {
    getAll(options: CommonOptions): Promise<GetAllReturnData<DocumentModel>>;

    getById(id: number): Promise<DocumentModel | null>;

    getOne(
        conditions: object,
        validateExistedProperties?: Array<{ [key: string]: any }>,
        validateNotExistedProperties?: Array<{ [key: string]: any }>
    ): Promise<DocumentModel | null>;

    create(
        input: DocumentModel,
        validateExistedProperties?: Array<{ [key: string]: any }>,
        validateNotExistedProperties?: Array<{ [key: string]: any }>
    ): Promise<DocumentModel>;

    update(
        id: number,
        input: DocumentModel,
        validateExistedProperties?: Array<{ [key: string]: any }>,
        validateNotExistedProperties?: Array<{ [key: string]: any }>
    ): Promise<DocumentModel>;

    delete(id: number): Promise<void>;

    isExists(conditions: object): Promise<boolean>;

    checkExisted(conditions: object): Promise<void>;

    checkNotExisted(conditions: object): Promise<void>;

    convertToApiResponse(input: DocumentModel): ApiModel;

    /**
     * Get current amount document
     */
    getDocumentAmount(conditions?: object): Promise<number>;

    getWithAggregation<AT>(aggregations: object[]): Promise<AT[]>;
}

export interface ServiceControllerBaseInterface {
    router: Router;
}
