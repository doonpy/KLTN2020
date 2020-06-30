import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';
import {
    VisualAdministrativeProvinceApiModel,
    VisualAdministrativeProvinceDocumentModel,
} from '../province/interface';

export interface VisualAdministrativeDistrictDocumentModel
    extends DocumentModelBase {
    name: string;
    code: string;
    acreage: number;
    provinceId: number | VisualAdministrativeProvinceDocumentModel;
}

export interface VisualAdministrativeDistrictApiModel extends ApiModelBase {
    name: string | null;
    code: string | null;
    acreage: number | null;
    province?: VisualAdministrativeProvinceApiModel | number | null;
}

export interface VisualAdministrativeDistrictRequestParamSchema
    extends CommonRequestParamSchema {}

export interface VisualAdministrativeDistrictRequestQuerySchema
    extends CommonRequestQuerySchema {}

export interface VisualAdministrativeDistrictRequestBodySchema
    extends CommonRequestBodySchema {
    name: string;
    code: string;
    provinceId: number;
}
