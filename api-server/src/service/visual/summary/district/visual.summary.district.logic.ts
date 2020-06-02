import VisualSummaryDistrictModel from '@service/visual/summary/district/visual.summary.district.model';
import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import { VisualSummaryDistrictApiModel, VisualSummaryDistrictDocumentModel } from './visual.summary.district.interface';
import { VisualAdministrativeDistrictApiModel } from '../../administrative/district/visual.administrative.district.interface';
import VisualAdministrativeDistrictLogic from '../../administrative/district/visual.administrative.district.logic';

export default class VisualSummaryDistrictLogic extends CommonServiceLogicBase<
    VisualSummaryDistrictDocumentModel,
    VisualSummaryDistrictApiModel
> {
    public static instance: VisualSummaryDistrictLogic;

    constructor() {
        super(VisualSummaryDistrictModel);
    }

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
        let district: VisualAdministrativeDistrictApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualAdministrativeDistrictLogic.getInstance().convertToApiResponse(districtId);
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
