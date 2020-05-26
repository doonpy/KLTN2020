import {
    VisualizationSummaryDistrictApiModel,
    VisualizationSummaryDistrictDocumentModel,
    VisualizationSummaryDistrictLogicInterface,
} from './visualization.summary.district.interface';
import { VisualizationDistrictApiModel } from '../../administrative/district/visualization.district.interface';
import VisualizationDistrictLogic from '../../administrative/district/visualization.district.logic';

export default class VisualizationSummaryDistrictLogic implements VisualizationSummaryDistrictLogicInterface {
    public static instance: VisualizationSummaryDistrictLogic;

    /**
     * @return {VisualizationSummaryDistrictLogic}
     */
    public static getInstance(): VisualizationSummaryDistrictLogic {
        if (!this.instance) {
            this.instance = new VisualizationSummaryDistrictLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualizationSummaryDistrictDocumentModel} document
     *
     * @return {VisualizationSummaryDistrictDocumentModel}
     */
    public async populateDocument(
        document: VisualizationSummaryDistrictDocumentModel
    ): Promise<VisualizationSummaryDistrictDocumentModel> {
        return document.populate('districtId').execPopulate();
    }

    /**
     * @param {VisualizationSummaryDistrictDocumentModel}
     *
     * @return {VisualizationSummaryDistrictApiModel}
     */
    public convertToApiResponse({
        _id,
        districtId,
        summaryAmount,
        summary,
        cTime,
        mTime,
    }: VisualizationSummaryDistrictDocumentModel): VisualizationSummaryDistrictApiModel {
        let district: VisualizationDistrictApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualizationDistrictLogic.getInstance().convertToApiResponse(districtId);
            } else {
                district = districtId;
            }
        }

        return {
            id: _id ?? null,
            district,
            summaryAmount: summaryAmount ?? null,
            summary: summary ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}
