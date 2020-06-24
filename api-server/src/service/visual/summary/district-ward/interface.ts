import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';
import {
    VisualAdministrativeWardApiModel,
    VisualAdministrativeWardDocumentModel,
} from '../../administrative/ward/interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from '../../administrative/district/interface';
import { VisualSummary } from '@service/visual/summary/interface';

export interface VisualSummaryDistrictWardDocumentModel
    extends DocumentModelBase {
    districtId: number | VisualAdministrativeDistrictDocumentModel;
    wardId: number | VisualAdministrativeWardDocumentModel;
    summaryAmount: number;
    summary: Array<{
        transactionType: number;
        propertyType: number;
        amount: number;
    }>;
}

export interface VisualSummaryDistrictWardApiModel extends ApiModelBase {
    district: VisualAdministrativeDistrictApiModel | number | null;
    ward: VisualAdministrativeWardApiModel | number | null;
    summaryAmount: number | null;
    summary: Array<{
        transactionType: number;
        propertyType: number;
        amount: number;
    }> | null;
}

export interface VisualSummaryDistrictWardRequestParamSchema
    extends CommonRequestParamSchema {}

export interface VisualSummaryDistrictWardRequestQuerySchema
    extends CommonRequestQuerySchema {}

export interface VisualSummaryDistrictWardRequestBodySchema
    extends CommonRequestBodySchema {
    districtId: number;
    wardId: number;
    summaryAmount: number;
    summary: VisualSummary[];
}
