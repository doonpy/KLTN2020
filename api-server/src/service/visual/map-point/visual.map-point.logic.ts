import VisualMapPointModel from '@service/visual/map-point/visual.map-point.model';
import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import { VisualMapPointApiModel, VisualMapPointDocumentModel } from './visual.map-point.interface';
import { VisualAdministrativeDistrictApiModel } from '../administrative/district/visual.administrative.district.interface';
import VisualAdministrativeDistrictLogic from '../administrative/district/visual.administrative.district.logic';
import { VisualAdministrativeWardApiModel } from '../administrative/ward/visual.administrative.ward.interface';
import VisualAdministrativeWardLogic from '../administrative/ward/visual.administrative.ward.logic';

export default class VisualMapPointLogic extends CommonServiceLogicBase<
    VisualMapPointDocumentModel,
    VisualMapPointApiModel
> {
    public static instance: VisualMapPointLogic;

    constructor() {
        super(VisualMapPointModel);
    }

    /**
     * @return {VisualMapPointLogic}
     */
    public static getInstance(): VisualMapPointLogic {
        if (!this.instance) {
            this.instance = new VisualMapPointLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualMapPointDocumentModel} input
     *
     * @return {VisualMapPointApiModel}
     */
    public convertToApiResponse({
        _id,
        districtId,
        wardId,
        lat,
        lng,
        points,
        cTime,
        mTime,
    }: VisualMapPointDocumentModel): VisualMapPointApiModel {
        let district: VisualAdministrativeDistrictApiModel | number | null = null;
        let ward: VisualAdministrativeWardApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualAdministrativeDistrictLogic.getInstance().convertToApiResponse(districtId);
            } else {
                district = districtId;
            }
        }

        if (wardId) {
            if (typeof wardId === 'object') {
                ward = VisualAdministrativeWardLogic.getInstance().convertToApiResponse(wardId);
            } else {
                ward = wardId;
            }
        }

        return {
            id: _id ?? null,
            district,
            ward,
            lat,
            lng,
            points,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}
