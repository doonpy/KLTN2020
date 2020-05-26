import { CommonApiModel, CommonDocumentModel } from '../../../../common/service/common.service.interface';
import { VisualizationCommonLogicInterface } from '../../visualization.common.interface';
import {
    VisualizationDistrictApiModel,
    VisualizationDistrictDocumentModel,
} from '../../administrative/district/visualization.district.interface';

export interface VisualizationSummaryDistrictDocumentModel extends CommonDocumentModel {
    districtId: number | VisualizationDistrictDocumentModel;
    summaryAmount: number;
    summary: { transactionType: number; propertyType: number; amount: number }[];
}

export interface VisualizationSummaryDistrictApiModel extends CommonApiModel {
    district: VisualizationDistrictApiModel | number | null;
    summaryAmount: number | null;
    summary:
        | {
              transactionType: number;
              propertyType: number;
              amount: number;
          }[]
        | null;
}

export interface VisualizationSummaryDistrictLogicInterface extends VisualizationCommonLogicInterface {
    /**
     * @param {VisualizationSummaryDistrictDocumentModel} document
     *
     * @return {VisualizationSummaryDistrictDocumentModel}
     */
    populateDocument(
        document: VisualizationSummaryDistrictDocumentModel
    ): Promise<VisualizationSummaryDistrictDocumentModel>;
}
