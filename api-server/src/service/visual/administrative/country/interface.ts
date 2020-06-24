import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';

export interface VisualAdministrativeCountryDocumentModel
    extends DocumentModelBase {
    name: string;
    code: string;
    acreage: number;
}

export interface VisualAdministrativeCountryApiModel extends ApiModelBase {
    name: string | null;
    code: string | null;
    acreage: number | null;
}

export interface VisualAdministrativeCountryRequestParamSchema
    extends CommonRequestParamSchema {}

export interface VisualAdministrativeCountryRequestQuerySchema
    extends CommonRequestQuerySchema {}

export interface VisualAdministrativeCountryRequestBodySchema
    extends CommonRequestBodySchema {
    name: string;
    code: string;
    acreage: number;
}
