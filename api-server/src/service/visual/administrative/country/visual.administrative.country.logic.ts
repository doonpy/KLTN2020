import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import VisualAdministrativeCountryModel from '@service/visual/administrative/country/visual.administrative.country.model';
import {
    VisualAdministrativeCountryApiModel,
    VisualAdministrativeCountryDocumentModel,
} from './visual.administrative.country.interface';

export default class VisualAdministrativeCountryLogic extends CommonServiceLogicBase<
    VisualAdministrativeCountryDocumentModel,
    VisualAdministrativeCountryApiModel
> {
    public static instance: VisualAdministrativeCountryLogic;

    constructor() {
        super(VisualAdministrativeCountryModel);
    }

    /**
     * @return {VisualAdministrativeCountryLogic}
     */
    public static getInstance(): VisualAdministrativeCountryLogic {
        if (!this.instance) {
            this.instance = new VisualAdministrativeCountryLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualAdministrativeCountryDocumentModel} input
     *
     * @return {VisualAdministrativeCountryApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        code,
        acreage,
        cTime,
        mTime,
    }: VisualAdministrativeCountryDocumentModel): VisualAdministrativeCountryApiModel {
        return {
            id: _id ?? null,
            name: name ?? null,
            code: code ?? null,
            acreage: acreage ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}
