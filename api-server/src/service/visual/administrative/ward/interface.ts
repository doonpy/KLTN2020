import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from '../district/interface';

export interface VisualAdministrativeWardDocumentModel
    extends DocumentModelBase {
    name: string;
    code: string;
    districtId: number | VisualAdministrativeDistrictDocumentModel;
}

export interface VisualAdministrativeWardApiModel extends ApiModelBase {
    name: string | null;
    code: string | null;
    district?: VisualAdministrativeDistrictApiModel | number | null;
}

export interface VisualAdministrativeWardRequestParamSchema
    extends CommonRequestParamSchema {}

export interface VisualAdministrativeWardRequestQuerySchema
    extends CommonRequestQuerySchema {}

export interface VisualAdministrativeWardRequestBodySchema
    extends CommonRequestBodySchema {
    name: string;
    code: string;
    districtId: number;
}
