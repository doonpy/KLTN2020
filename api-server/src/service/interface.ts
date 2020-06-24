import { Document, FilterQuery } from 'mongoose';
import { ParamsDictionary, Request } from 'express-serve-static-core';

export interface CommonRequest<
    P extends CommonRequestParamSchema,
    B extends CommonRequestBodySchema,
    Q extends CommonRequestQuerySchema
> extends Request<P, B, B, Q> {
    locals?: {
        getConditions?: Record<string, any>;
        validateExist?: Array<FilterQuery<DocumentModelBase>>;
        validateNotExist?: Array<FilterQuery<DocumentModelBase>>;
        responseBody?: Record<string, any>;
        statusCode?: number;
    };
}

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

export interface CommonOptions<DocumentModel extends DocumentModelBase> {
    limit?: number;
    offset?: number;
    conditions?: FilterQuery<DocumentModel>;
    sort?: Record<string, any>;
}

export interface ValidateProperties<DocumentModel extends DocumentModelBase> {
    exist?: Array<FilterQuery<DocumentModel>>;
    notExist?: Array<FilterQuery<DocumentModel>>;
}

export interface CommonRequestParamSchema extends ParamsDictionary {
    id: string;
}

export interface CommonRequestQuerySchema {
    limit: string;
    offset: string;
}

export interface CommonRequestBodySchema {}
