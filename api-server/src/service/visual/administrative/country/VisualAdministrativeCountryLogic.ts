import ServiceLogicBase from '@service/ServiceLogicBase';
import Model from '@service/visual/administrative/country/model';
import {
    VisualAdministrativeCountryApiModel,
    VisualAdministrativeCountryDocumentModel,
} from './interface';

export default class VisualAdministrativeCountryLogic extends ServiceLogicBase<
    VisualAdministrativeCountryDocumentModel,
    VisualAdministrativeCountryApiModel
> {
    public static instance: VisualAdministrativeCountryLogic;

    constructor() {
        super(Model);
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
