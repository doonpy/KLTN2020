import Model from '@service/visual/administrative/district/model';
import CommonServiceLogicBase from '@service/CommonServiceLogicBase';
import { VisualAdministrativeProvinceApiModel } from '../province/interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from './interface';
import VisualAdministrativeProvinceLogic from '../province/VisualAdministrativeProvinceLogic';

export default class VisualAdministrativeDistrictLogic extends CommonServiceLogicBase<
    VisualAdministrativeDistrictDocumentModel,
    VisualAdministrativeDistrictApiModel
> {
    public static instance: VisualAdministrativeDistrictLogic;

    constructor() {
        super(Model);
    }

    /**
     * @return {VisualAdministrativeDistrictLogic}
     */
    public static getInstance(): VisualAdministrativeDistrictLogic {
        if (!this.instance) {
            this.instance = new VisualAdministrativeDistrictLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualAdministrativeDistrictDocumentModel} input
     *
     * @return {VisualAdministrativeDistrictApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        code,
        provinceId,
        acreage,
        cTime,
        mTime,
    }: VisualAdministrativeDistrictDocumentModel): VisualAdministrativeDistrictApiModel {
        let province:
            | VisualAdministrativeProvinceApiModel
            | number
            | null = null;

        if (provinceId) {
            if (typeof provinceId === 'object') {
                province = VisualAdministrativeProvinceLogic.getInstance().convertToApiResponse(
                    provinceId
                );
            } else {
                province = provinceId;
            }
        }

        return {
            id: _id ?? null,
            name: name ?? null,
            code: code ?? null,
            acreage: acreage ?? null,
            province,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}
