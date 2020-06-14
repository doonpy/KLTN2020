import { ApiModelBase, DocumentModelBase } from '@service/interface';
import {
    VisualAdministrativeWardApiModel,
    VisualAdministrativeWardDocumentModel,
} from '../../administrative/ward/interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from '../../administrative/district/interface';

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
