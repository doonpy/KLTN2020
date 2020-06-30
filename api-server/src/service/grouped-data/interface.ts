import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';
import { RawDataApiModel, RawDataDocumentModel } from '../raw-data/interface';
import { CatalogLocator } from '@service/catalog/interface';

export interface GroupedDataApiModel extends ApiModelBase {
    items: Array<RawDataApiModel | number | null>;
}

export interface GroupedDataDocumentModel extends DocumentModelBase {
    items: Array<RawDataDocumentModel | number>;
}

export interface GroupedDataRequestParamSchema
    extends CommonRequestParamSchema {}

export interface GroupedDataRequestQuerySchema
    extends CommonRequestQuerySchema {
    items: string;
}

export interface GroupedDataRequestBodySchema extends CommonRequestBodySchema {
    items: string;
}
