import {
    VisualizationProvinceApiModel,
    VisualizationProvinceDocumentModel,
    VisualizationProvinceLogicInterface,
} from './visualization.province.interface';
import { VisualizationCountryApiModel } from '../country/visualization.country.interface';
import VisualizationCountryLogic from '../country/visualization.country.logic';

export default class VisualizationProvinceLogic implements VisualizationProvinceLogicInterface {
    public static instance: VisualizationProvinceLogic;

    /**
     * @return {VisualizationProvinceLogic}
     */
    public static getInstance(): VisualizationProvinceLogic {
        if (!this.instance) {
            this.instance = new VisualizationProvinceLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualizationProvinceDocumentModel} document
     *
     * @return {VisualizationProvinceDocumentModel}
     */
    public async populateDocument(
        document: VisualizationProvinceDocumentModel
    ): Promise<VisualizationProvinceDocumentModel> {
        return document.populate('countryId').execPopulate();
    }

    /**
     * @param {VisualizationProvinceDocumentModel} input
     *
     * @return {VisualizationProvinceApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        code,
        countryId,
        acreage,
        cTime,
        mTime,
    }: VisualizationProvinceDocumentModel): VisualizationProvinceApiModel {
        let country: VisualizationCountryApiModel | number | null = null;

        if (countryId) {
            if (typeof countryId === 'object') {
                country = VisualizationCountryLogic.getInstance().convertToApiResponse(countryId);
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
