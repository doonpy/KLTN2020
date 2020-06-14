import { ApiModelBase, DocumentModelBase } from '@service/interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from '../../administrative/district/interface';

export interface VisualSummaryDistrictDocumentModel extends DocumentModelBase {
    districtId: number | VisualAdministrativeDistrictDocumentModel;
    summaryAmount: number;
    summary: Array<{
        transactionType: number;
        propertyType: number;
        amount: number;
    }>;
}

export interface VisualSummaryDistrictApiModel extends ApiModelBase {
    district: VisualAdministrativeDistrictApiModel | number | null;
    summaryAmount: number | null;
    summary: Array<{
        transactionType: number;
        propertyType: number;
        amount: number;
    }> | null;
}
