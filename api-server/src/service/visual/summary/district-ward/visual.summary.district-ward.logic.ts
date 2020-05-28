import {
    VisualSummaryDistrictWardApiModel,
    VisualSummaryDistrictWardDocumentModel,
    VisualSummaryDistrictWardLogicInterface,
} from './visual.summary.district-ward.interface';
import { VisualizationDistrictApiModel } from '../../administrative/district/visual.district.interface';
import VisualDistrictLogic from '../../administrative/district/visual.district.logic';
import { VisualWardApiModel } from '../../administrative/ward/visual.ward.interface';
import VisualWardLogic from '../../administrative/ward/visual.ward.logic';

export default class VisualSummaryDistrictWardLogic implements VisualSummaryDistrictWardLogicInterface {
    public static instance: VisualSummaryDistrictWardLogic;

    /**
     * @return {VisualSummaryDistrictWardLogic}
     */
    public static getInstance(): VisualSummaryDistrictWardLogic {
        if (!this.instance) {
            this.instance = new VisualSummaryDistrictWardLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualSummaryDistrictWardDocumentModel} document
     *
     * @return {VisualSummaryDistrictWardDocumentModel}
     */
    public async populateDocument(
        document: VisualSummaryDistrictWardDocumentModel
    ): Promise<VisualSummaryDistrictWardDocumentModel> {
        return document.populate('districtId wardId').execPopulate();
    }

    /**
     * @param {VisualSummaryDistrictWardDocumentModel}
     *
     * @return {VisualSummaryDistrictWardApiModel}
     */
    public convertToApiResponse({
        _id,
        districtId,
        wardId,
        summaryAmount,
        summary,
        cTime,
        mTime,
    }: VisualSummaryDistrictWardDocumentModel): VisualSummaryDistrictWardApiModel {
        let district: VisualizationDistrictApiModel | number | null = null;
        let ward: VisualWardApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualDistrictLogic.getInstance().convertToApiResponse(districtId);
            } else {
                district = districtId;
            }
        }

        if (wardId) {
            if (typeof wardId === 'object') {
                ward = VisualWardLogic.getInstance().convertToApiResponse(wardId);
            } else {
                ward = wardId;
            }
        }

        return {
            id: _id ?? null,
            district,
            ward,
            summaryAmount: summaryAmount ?? null,
            summary: summary ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}
