import { VisualCountryApiModel, VisualCountryDocumentModel } from './visual.country.interface';
import { VisualCommonLogicInterface } from '../../visual.common.interface';

export default class VisualCountryLogic implements VisualCommonLogicInterface {
    public static instance: VisualCountryLogic;

    /**
     * @return {VisualCountryLogic}
     */
    public static getInstance(): VisualCountryLogic {
        if (!this.instance) {
            this.instance = new VisualCountryLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualCountryDocumentModel} input
     *
     * @return {VisualCountryApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        code,
        acreage,
        cTime,
        mTime,
    }: VisualCountryDocumentModel): VisualCountryApiModel {
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
