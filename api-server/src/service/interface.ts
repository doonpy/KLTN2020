import { Document, MongooseFilterQuery } from 'mongoose';
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

export interface CommonOptions<DocumentModel extends DocumentModelBase> {
    limit?: number;
    offset?: number;
    conditions?: MongooseFilterQuery<DocumentModel>;
    sort?: Record<string, any>;
}

export interface ValidateProperties<DocumentModel extends DocumentModelBase> {
    exist?: MongooseFilterQuery<DocumentModel>;
    notExist?: MongooseFilterQuery<DocumentModel>;
}

export interface ServiceControllerBaseInterface {
    router: Router;
}
