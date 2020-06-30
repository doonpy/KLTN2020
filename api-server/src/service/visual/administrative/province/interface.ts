import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';
import {
    VisualAdministrativeCountryApiModel,
    VisualAdministrativeCountryDocumentModel,
} from '../country/interface';

export interface VisualAdministrativeProvinceDocumentModel
    extends DocumentModelBase {
    name: string;
    code: string;
    countryId: number | VisualAdministrativeCountryDocumentModel;
    acreage: number;
}

export interface VisualAdministrativeProvinceApiModel extends ApiModelBase {
    name: string | null;
    code: string | null;
    country: number | VisualAdministrativeCountryApiModel | null;
    acreage: number | null;
}

export interface VisualAdministrativeProvinceRequestParamSchema
    extends CommonRequestParamSchema {}

export interface VisualAdministrativeProvinceRequestQuerySchema
    extends CommonRequestQuerySchema {}

export interface VisualAdministrativeProvinceRequestBodySchema
    extends CommonRequestBodySchema {
    name: string;
    code: string;
    countryId: number;
    acreage: number;
}
