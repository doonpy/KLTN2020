import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';
import { CatalogApiModel, CatalogDocumentModel } from '../catalog/interface';

export interface DetailUrlApiModel extends ApiModelBase {
    catalog: CatalogApiModel | number | null;
    url: string | null;
    isExtracted: boolean | null;
    requestRetries: number | null;
}

export interface DetailUrlDocumentModel extends DocumentModelBase {
    catalogId: CatalogDocumentModel | number;
    url: string;
    isExtracted: boolean;
    requestRetries: number;
}

export interface DetailUrlRequestParamSchema extends CommonRequestParamSchema {}

export interface DetailUrlRequestQuerySchema extends CommonRequestQuerySchema {
    catalogId: string;
    url: string;
    isExtracted: string;
    requestRetries: string;
}

export interface DetailUrlRequestBodySchema extends CommonRequestBodySchema {
    catalogId: string;
    url: string;
    isExtracted: string;
    requestRetries: string;
}
