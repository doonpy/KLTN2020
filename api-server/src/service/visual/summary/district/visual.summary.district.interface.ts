import {
    CommonApiModel,
    CommonDocumentModel,
} from '@common/service/common.service.interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from '../../administrative/district/visual.administrative.district.interface';

export interface VisualSummaryDistrictDocumentModel
    extends CommonDocumentModel {
    districtId: number | VisualAdministrativeDistrictDocumentModel;
    summaryAmount: number;
    summary: Array<{
        transactionType: number;
        propertyType: number;
        amount: number;
    }>;
}

export interface VisualSummaryDistrictApiModel extends CommonApiModel {
    district: VisualAdministrativeDistrictApiModel | number | null;
    summaryAmount: number | null;
    summary: Array<{
        transactionType: number;
        propertyType: number;
        amount: number;
    }> | null;
}
