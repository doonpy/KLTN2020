import { VisualizationProvinceApiModel } from '../province/visualization.province.interface';
import {
    VisualizationDistrictApiModel,
    VisualizationDistrictDocumentModel,
    VisualizationDistrictLogicInterface,
} from './visualization.district.interface';
import VisualizationProvinceLogic from '../province/visualization.province.logic';

export default class VisualizationDistrictLogic implements VisualizationDistrictLogicInterface {
    public static instance: VisualizationDistrictLogic;

    /**
     * @return {VisualizationSummaryDistrictLogic}
     */
    public static getInstance(): VisualizationDistrictLogic {
        if (!this.instance) {
            this.instance = new VisualizationDistrictLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualizationDistrictDocumentModel} document
     *
     * @return {VisualizationDistrictDocumentModel}
     */
    public async populateDocument(
        document: VisualizationDistrictDocumentModel
    ): Promise<VisualizationDistrictDocumentModel> {
        return document.populate('provinceId').execPopulate();
    }

    /**
     * @param {VisualizationDistrictDocumentModel} input
     *
     * @return {VisualizationDistrictApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        code,
        provinceId,
        acreage,
        cTime,
        mTime,
    }: VisualizationDistrictDocumentModel): VisualizationDistrictApiModel {
        let province: VisualizationProvinceApiModel | number | null = null;

        if (provinceId) {
            if (typeof provinceId === 'object') {
                province = VisualizationProvinceLogic.getInstance().convertToApiResponse(provinceId);
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
