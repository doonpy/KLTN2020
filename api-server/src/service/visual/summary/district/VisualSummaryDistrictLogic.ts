import Model from '@service/visual/summary/district/model';
import ServiceLogicBase from '@service/ServiceLogicBase';
import {
    VisualSummaryDistrictApiModel,
    VisualSummaryDistrictDocumentModel,
} from './interface';
import { VisualAdministrativeDistrictApiModel } from '../../administrative/district/interface';
import VisualAdministrativeDistrictLogic from '../../administrative/district/VisualAdministrativeDistrictLogic';

export default class VisualSummaryDistrictLogic extends ServiceLogicBase<
    VisualSummaryDistrictDocumentModel,
    VisualSummaryDistrictApiModel
> {
    public static instance: VisualSummaryDistrictLogic;

    constructor() {
        super(Model);
    }

    public static getInstance(): VisualSummaryDistrictLogic {
        if (!this.instance) {
            this.instance = new VisualSummaryDistrictLogic();
        }
        return this.instance;
    }

    public convertToApiResponse({
        _id,
        districtId,
        summaryAmount,
        summary,
        cTime,
        mTime,
    }: VisualSummaryDistrictDocumentModel): VisualSummaryDistrictApiModel {
        let district:
            | VisualAdministrativeDistrictApiModel
            | number
            | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualAdministrativeDistrictLogic.getInstance().convertToApiResponse(
                    districtId
                );
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
