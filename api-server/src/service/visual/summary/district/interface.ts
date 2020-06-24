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
} from '../../administrative/district/interface';
import { VisualSummary } from '@service/visual/summary/interface';

export interface VisualSummaryDistrictDocumentModel extends DocumentModelBase {
    districtId: number | VisualAdministrativeDistrictDocumentModel;
    summaryAmount: number;
    summary: VisualSummary[];
}

export interface VisualSummaryDistrictApiModel extends ApiModelBase {
    district: VisualAdministrativeDistrictApiModel | number | null;
    summaryAmount: number | null;
    summary: VisualSummary[] | null;
}

export interface VisualSummaryDistrictRequestParamSchema
    extends CommonRequestParamSchema {}

export interface VisualSummaryDistrictRequestQuerySchema
    extends CommonRequestQuerySchema {}

export interface VisualSummaryDistrictRequestBodySchema
    extends CommonRequestBodySchema {
    districtId: number;
    summaryAmount: number;
    summary: VisualSummary[];
}
