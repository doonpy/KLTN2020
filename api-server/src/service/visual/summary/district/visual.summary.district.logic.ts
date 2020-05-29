import {
    VisualSummaryDistrictApiModel,
    VisualSummaryDistrictDocumentModel,
    VisualSummaryDistrictLogicInterface,
} from './visual.summary.district.interface';
import { VisualDistrictApiModel } from '../../administrative/district/visual.district.interface';
import VisualDistrictLogic from '../../administrative/district/visual.district.logic';

export default class VisualSummaryDistrictLogic implements VisualSummaryDistrictLogicInterface {
    public static instance: VisualSummaryDistrictLogic;

    /**
     * @return {VisualSummaryDistrictLogic}
     */
    public static getInstance(): VisualSummaryDistrictLogic {
        if (!this.instance) {
            this.instance = new VisualSummaryDistrictLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualSummaryDistrictDocumentModel} document
     *
     * @return {VisualSummaryDistrictDocumentModel}
     */
    public async populateDocument(
        document: VisualSummaryDistrictDocumentModel
    ): Promise<VisualSummaryDistrictDocumentModel> {
        return document.populate('districtId').execPopulate();
    }

    /**
     * @param {VisualSummaryDistrictDocumentModel}
     *
     * @return {VisualSummaryDistrictApiModel}
     */
    public convertToApiResponse({
        _id,
        districtId,
        summaryAmount,
        summary,
        cTime,
        mTime,
    }: VisualSummaryDistrictDocumentModel): VisualSummaryDistrictApiModel {
        let district: VisualDistrictApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualDistrictLogic.getInstance().convertToApiResponse(districtId);
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
