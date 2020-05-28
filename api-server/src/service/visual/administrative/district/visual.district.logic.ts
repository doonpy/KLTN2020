import { VisualProvinceApiModel } from '../province/visual.province.interface';
import {
    VisualDistrictDocumentModel,
    VisualDistrictLogicInterface,
    VisualizationDistrictApiModel,
} from './visual.district.interface';
import VisualProvinceLogic from '../province/visual.province.logic';

export default class VisualDistrictLogic implements VisualDistrictLogicInterface {
    public static instance: VisualDistrictLogic;

    /**
     * @return {VisualizationSummaryDistrictLogic}
     */
    public static getInstance(): VisualDistrictLogic {
        if (!this.instance) {
            this.instance = new VisualDistrictLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualDistrictDocumentModel} document
     *
     * @return {VisualDistrictDocumentModel}
     */
    public async populateDocument(document: VisualDistrictDocumentModel): Promise<VisualDistrictDocumentModel> {
        return document.populate('provinceId').execPopulate();
    }

    /**
     * @param {VisualDistrictDocumentModel} input
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
    }: VisualDistrictDocumentModel): VisualizationDistrictApiModel {
        let province: VisualProvinceApiModel | number | null = null;

        if (provinceId) {
            if (typeof provinceId === 'object') {
                province = VisualProvinceLogic.getInstance().convertToApiResponse(provinceId);
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
