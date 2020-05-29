import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';
import { VisualWardApiModel, VisualWardDocumentModel } from '../../administrative/ward/visual.ward.interface';
import { VisualCommonLogicInterface } from '../../visual.common.interface';
import {
    VisualDistrictApiModel,
    VisualDistrictDocumentModel,
} from '../../administrative/district/visual.district.interface';

export interface VisualSummaryDistrictWardDocumentModel extends CommonDocumentModel {
    districtId: number | VisualDistrictDocumentModel;
    wardId: number | VisualWardDocumentModel;
    summaryAmount: number;
    summary: {
        transactionType: number;
        propertyType: number;
        amount: number;
    }[];
}

export interface VisualSummaryDistrictWardApiModel extends CommonApiModel {
    district: VisualDistrictApiModel | number | null;
    ward: VisualWardApiModel | number | null;
    summaryAmount: number | null;
    summary:
        | {
              transactionType: number;
              propertyType: number;
              amount: number;
          }[]
        | null;
}

export interface VisualSummaryDistrictWardLogicInterface extends VisualCommonLogicInterface {
    /**
     * @param {VisualSummaryDistrictWardDocumentModel} document
     *
     * @return {VisualSummaryDistrictWardDocumentModel}
     */
    populateDocument(document: VisualSummaryDistrictWardDocumentModel): Promise<VisualSummaryDistrictWardDocumentModel>;
}
