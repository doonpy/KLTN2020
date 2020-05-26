import { VisualizationCountryApiModel, VisualizationCountryDocumentModel } from './visualization.country.interface';
import { VisualizationCommonLogicInterface } from '../../visualization.common.interface';

export default class VisualizationCountryLogic implements VisualizationCommonLogicInterface {
    public static instance: VisualizationCountryLogic;

    /**
     * @return {VisualizationCountryLogic}
     */
    public static getInstance(): VisualizationCountryLogic {
        if (!this.instance) {
            this.instance = new VisualizationCountryLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualizationCountryDocumentModel} input
     *
     * @return {VisualizationCountryApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        code,
        acreage,
        cTime,
        mTime,
    }: VisualizationCountryDocumentModel): VisualizationCountryApiModel {
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
