import {
    VisualizationProvinceLogicInterface,
    VisualProvinceApiModel,
    VisualProvinceDocumentModel,
} from './visual.province.interface';
import { VisualCountryApiModel } from '../country/visual.country.interface';
import VisualCountryLogic from '../country/visual.country.logic';

export default class VisualProvinceLogic implements VisualizationProvinceLogicInterface {
    public static instance: VisualProvinceLogic;

    /**
     * @return {VisualProvinceLogic}
     */
    public static getInstance(): VisualProvinceLogic {
        if (!this.instance) {
            this.instance = new VisualProvinceLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualProvinceDocumentModel} document
     *
     * @return {VisualProvinceDocumentModel}
     */
    public async populateDocument(document: VisualProvinceDocumentModel): Promise<VisualProvinceDocumentModel> {
        return document.populate('countryId').execPopulate();
    }

    /**
     * @param {VisualProvinceDocumentModel} input
     *
     * @return {VisualProvinceApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        code,
        countryId,
        acreage,
        cTime,
        mTime,
    }: VisualProvinceDocumentModel): VisualProvinceApiModel {
        let country: VisualCountryApiModel | number | null = null;

        if (countryId) {
            if (typeof countryId === 'object') {
                country = VisualCountryLogic.getInstance().convertToApiResponse(countryId);
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
