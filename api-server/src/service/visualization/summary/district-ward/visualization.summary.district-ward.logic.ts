import {
    VisualizationSummaryDistrictWardApiModel,
    VisualizationSummaryDistrictWardDocumentModel,
    VisualizationSummaryDistrictWardLogicInterface,
} from './visualization.summary.district-ward.interface';
import { VisualizationDistrictApiModel } from '../../administrative/district/visualization.district.interface';
import VisualizationDistrictLogic from '../../administrative/district/visualization.district.logic';
import { VisualizationWardApiModel } from '../../administrative/ward/visualization.ward.interface';
import VisualizationWardLogic from '../../administrative/ward/visualization.ward.logic';

export default class VisualizationSummaryDistrictWardLogic implements VisualizationSummaryDistrictWardLogicInterface {
    public static instance: VisualizationSummaryDistrictWardLogic;

    /**
     * @return {VisualizationSummaryDistrictWardLogic}
     */
    public static getInstance(): VisualizationSummaryDistrictWardLogic {
        if (!this.instance) {
            this.instance = new VisualizationSummaryDistrictWardLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualizationSummaryDistrictWardDocumentModel} document
     *
     * @return {VisualizationSummaryDistrictWardDocumentModel}
     */
    public async populateDocument(
        document: VisualizationSummaryDistrictWardDocumentModel
    ): Promise<VisualizationSummaryDistrictWardDocumentModel> {
        return document.populate('districtId wardId').execPopulate();
    }

    /**
     * @param {VisualizationSummaryDistrictWardDocumentModel}
     *
     * @return {VisualizationSummaryDistrictWardApiModel}
     */
    public convertToApiResponse({
        _id,
        districtId,
        wardId,
        summaryAmount,
        summary,
        cTime,
        mTime,
    }: VisualizationSummaryDistrictWardDocumentModel): VisualizationSummaryDistrictWardApiModel {
        let district: VisualizationDistrictApiModel | number | null = null;
        let ward: VisualizationWardApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualizationDistrictLogic.getInstance().convertToApiResponse(districtId);
            } else {
                district = districtId;
            }
        }

        if (wardId) {
            if (typeof wardId === 'object') {
                ward = VisualizationWardLogic.getInstance().convertToApiResponse(wardId);
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
