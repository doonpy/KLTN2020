import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import VisualAdministrativeProvinceModel from '@service/visual/administrative/province/visual.administrative.province.model';
import {
    VisualAdministrativeProvinceApiModel,
    VisualAdministrativeProvinceDocumentModel,
} from './visual.administrative.province.interface';
import { VisualAdministrativeCountryApiModel } from '../country/visual.administrative.country.interface';
import VisualAdministrativeCountryLogic from '../country/visual.administrative.country.logic';

export default class VisualAdministrativeProvinceLogic extends CommonServiceLogicBase<
    VisualAdministrativeProvinceDocumentModel,
    VisualAdministrativeProvinceApiModel
> {
    public static instance: VisualAdministrativeProvinceLogic;

    constructor() {
        super(VisualAdministrativeProvinceModel);
    }

    /**
     * @return {VisualAdministrativeProvinceLogic}
     */
    public static getInstance(): VisualAdministrativeProvinceLogic {
        if (!this.instance) {
            this.instance = new VisualAdministrativeProvinceLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualAdministrativeProvinceDocumentModel} input
     *
     * @return {VisualAdministrativeProvinceApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        code,
        countryId,
        acreage,
        cTime,
        mTime,
    }: VisualAdministrativeProvinceDocumentModel): VisualAdministrativeProvinceApiModel {
        let country: VisualAdministrativeCountryApiModel | number | null = null;

        if (countryId) {
            if (typeof countryId === 'object') {
                country = VisualAdministrativeCountryLogic.getInstance().convertToApiResponse(countryId);
            } else {
                country = countryId;
            }
        }
        return {
            id: _id ?? null,
            name: name ?? null,
            code: code ?? null,
            country,
            acreage: acreage ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}
