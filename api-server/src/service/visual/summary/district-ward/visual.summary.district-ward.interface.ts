import {
    CommonApiModel,
    CommonDocumentModel,
} from '@common/service/common.service.interface';
import {
    VisualAdministrativeWardApiModel,
    VisualAdministrativeWardDocumentModel,
} from '../../administrative/ward/visual.administrative.ward.interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from '../../administrative/district/visual.administrative.district.interface';

export interface VisualSummaryDistrictWardDocumentModel
    extends CommonDocumentModel {
    districtId: number | VisualAdministrativeDistrictDocumentModel;
    wardId: number | VisualAdministrativeWardDocumentModel;
    summaryAmount: number;
    summary: Array<{
        transactionType: number;
        propertyType: number;
        amount: number;
    }>;
}

export interface VisualSummaryDistrictWardApiModel extends CommonApiModel {
    district: VisualAdministrativeDistrictApiModel | number | null;
    ward: VisualAdministrativeWardApiModel | number | null;
    summaryAmount: number | null;
    summary: Array<{
        transactionType: number;
        propertyType: number;
        amount: number;
    }> | null;
}
