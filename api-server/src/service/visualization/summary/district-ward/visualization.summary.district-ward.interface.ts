import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';
import {
    VisualizationWardApiModel,
    VisualizationWardDocumentModel,
} from '../../administrative/ward/visualization.ward.interface';
import { VisualizationCommonLogicInterface } from '../../visualization.common.interface';
import {
    VisualizationDistrictApiModel,
    VisualizationDistrictDocumentModel,
} from '../../administrative/district/visualization.district.interface';

export interface VisualizationSummaryDistrictWardDocumentModel extends CommonDocumentModel {
    districtId: number | VisualizationDistrictDocumentModel;
    wardId: number | VisualizationWardDocumentModel;
    summaryAmount: number;
    summary: {
        transactionType: number;
        propertyType: number;
        amount: number;
    }[];
}

export interface VisualizationSummaryDistrictWardApiModel extends CommonApiModel {
    district: VisualizationDistrictApiModel | number | null;
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

export interface VisualizationSummaryDistrictWardLogicInterface extends VisualizationCommonLogicInterface {
    /**
     * @param {VisualizationSummaryDistrictWardDocumentModel} document
     *
     * @return {VisualizationSummaryDistrictWardDocumentModel}
     */
    populateDocument(
        document: VisualizationSummaryDistrictWardDocumentModel
    ): Promise<VisualizationSummaryDistrictWardDocumentModel>;
}
