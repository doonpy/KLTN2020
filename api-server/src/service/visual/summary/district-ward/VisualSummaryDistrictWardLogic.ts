import Model from '@service/visual/summary/district-ward/model';
import ServiceLogicBase from '@service/ServiceLogicBase';
import {
    VisualSummaryDistrictWardApiModel,
    VisualSummaryDistrictWardDocumentModel,
} from './interface';
import { VisualAdministrativeDistrictApiModel } from '../../administrative/district/interface';
import VisualAdministrativeDistrictLogic from '../../administrative/district/VisualAdministrativeDistrictLogic';
import { VisualAdministrativeWardApiModel } from '../../administrative/ward/interface';
import VisualAdministrativeWardLogic from '../../administrative/ward/VisualAdministrativeWardLogic';

export default class VisualSummaryDistrictWardLogic extends ServiceLogicBase<
    VisualSummaryDistrictWardDocumentModel,
    VisualSummaryDistrictWardApiModel
> {
    public static instance: VisualSummaryDistrictWardLogic;

    constructor() {
        super(Model);
    }

    public static getInstance(): VisualSummaryDistrictWardLogic {
        if (!this.instance) {
            this.instance = new VisualSummaryDistrictWardLogic();
        }
        return this.instance;
    }

    public convertToApiResponse({
        _id,
        districtId,
        wardId,
        summaryAmount,
        summary,
        cTime,
        mTime,
    }: VisualSummaryDistrictWardDocumentModel): VisualSummaryDistrictWardApiModel {
        let district:
            | VisualAdministrativeDistrictApiModel
            | number
            | null = null;
        let ward: VisualAdministrativeWardApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualAdministrativeDistrictLogic.getInstance().convertToApiResponse(
                    districtId
                );
            } else {
                district = districtId;
            }
        }

        if (wardId) {
            if (typeof wardId === 'object') {
                ward = VisualAdministrativeWardLogic.getInstance().convertToApiResponse(
                    wardId
                );
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
