import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';
import { PatternApiModel, PatternDocumentModel } from '../pattern/interface';
import { HostApiModel, HostDocumentModel } from '../host/interface';

export interface CatalogLocator {
    detailUrl: string;
    pageNumber: string;
}

export interface CatalogApiModel extends ApiModelBase {
    title: string | null;
    url: string | null;
    locator: CatalogLocator | null;
    host: HostApiModel | number | null;
    pattern: PatternApiModel | number | null;
}

export interface CatalogDocumentModel extends DocumentModelBase {
    title: string;
    url: string;
    locator: CatalogLocator;
    hostId: HostDocumentModel | number;
    patternId: PatternDocumentModel | number;
}

export interface CatalogRequestParamSchema extends CommonRequestParamSchema {}

export interface CatalogRequestQuerySchema extends CommonRequestQuerySchema {
    title: string;
    url: string;
    hostId: string;
    patternId: string;
}

export interface CatalogRequestBodySchema extends CommonRequestBodySchema {
    title: string;
    url: string;
    locator: CatalogLocator;
    hostId: number;
    patternId: number;
}
