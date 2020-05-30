import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';
import { VisualCommonLogicInterface } from '../../visual.common.interface';
import {
    VisualDistrictApiModel,
    VisualDistrictDocumentModel,
} from '../../administrative/district/visual.district.interface';

export interface VisualSummaryDistrictDocumentModel extends CommonDocumentModel {
    districtId: number | VisualDistrictDocumentModel;
    summaryAmount: number;
    summary: { transactionType: number; propertyType: number; amount: number }[];
}

export interface VisualSummaryDistrictApiModel extends CommonApiModel {
    district: VisualDistrictApiModel | number | null;
    summaryAmount: number | null;
    summary:
        | {
              transactionType: number;
              propertyType: number;
              amount: number;
          }[]
        | null;
}

export interface VisualSummaryDistrictLogicInterface extends VisualCommonLogicInterface {
    /**
     * @param {VisualSummaryDistrictDocumentModel} document
     *
     * @return {VisualSummaryDistrictDocumentModel}
     */
    populateDocument(document: VisualSummaryDistrictDocumentModel): Promise<VisualSummaryDistrictDocumentModel>;
}
