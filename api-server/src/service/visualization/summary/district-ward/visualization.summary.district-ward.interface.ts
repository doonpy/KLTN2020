import { CommonApiModel, CommonDocumentModel } from '../../../../common/service/common.service.interface';
import { VisualizationWardApiModel } from '../../ward/visualization.ward.interface';

export interface VisualizationSummaryDistrictWardDocumentModel extends CommonDocumentModel {
    districtId: number;
    wardId: number;
    summaryAmount: number;
    summary: {
        transactionType: number;
        propertyType: number;
        amount: number;
    }[];
}

export interface VisualizationSummaryDistrictWardApiModel extends CommonApiModel {
    district: VisualizationSummaryDistrictWardApiModel | number | null;
    ward: VisualizationWardApiModel | number | null;
    summaryAmount: number | null;
    summary:
        | {
              transactionType: number;
              propertyType: number;
              amount: number;
          }[]
        | null;
}
