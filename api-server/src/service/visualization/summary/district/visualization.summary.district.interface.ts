import { CommonApiModel, CommonDocumentModel } from '../../../../common/service/common.service.interface';
import { VisualizationSummaryDistrictWardApiModel } from '../district-ward/visualization.summary.district-ward.interface';

export interface VisualizationSummaryDistrictDocumentModel extends CommonDocumentModel {
    districtId: number;
    summaryAmount: number;
    summary: { transactionType: number; propertyType: number; amount: number }[];
}

export interface VisualizationSummaryDistrictApiModel extends CommonApiModel {
    district: VisualizationSummaryDistrictWardApiModel | number | null;
    summaryAmount: number | null;
    summary:
        | {
              transactionType: number;
              propertyType: number;
              amount: number;
          }[]
        | null;
}
