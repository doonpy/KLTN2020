import { VisualizationProvinceApiModel, VisualizationProvinceDocumentModel } from './visualization.province.interface';
import { VisualizationCommonLogicInterface } from '../visualization.common.interface';

export default class VisualizationProvinceLogic implements VisualizationCommonLogicInterface {
    public static instance: VisualizationProvinceLogic;

    /**
     * @return {VisualizationSummaryDistrictLogic}
     */
    public static getInstance(): VisualizationProvinceLogic {
        if (!this.instance) {
            this.instance = new VisualizationProvinceLogic();
        }
        return this.instance;
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
        acreage,
        cTime,
        mTime,
    }: VisualizationProvinceDocumentModel): VisualizationProvinceApiModel {
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
