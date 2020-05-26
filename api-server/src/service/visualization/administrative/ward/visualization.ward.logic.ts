import { VisualizationDistrictApiModel } from '../district/visualization.district.interface';
import {
    VisualizationWardApiModel,
    VisualizationWardDocumentModel,
    VisualizationWardLogicInterface,
} from './visualization.ward.interface';
import VisualizationDistrictLogic from '../district/visualization.district.logic';

export default class VisualizationWardLogic implements VisualizationWardLogicInterface {
    public static instance: VisualizationWardLogic;

    /**
     * @return {VisualizationSummaryDistrictLogic}
     */
    public static getInstance(): VisualizationWardLogic {
        if (!this.instance) {
            this.instance = new VisualizationWardLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualizationWardDocumentModel} document
     *
     * @return {VisualizationWardDocumentModel}
     */
    public async populateDocument(document: VisualizationWardDocumentModel): Promise<VisualizationWardDocumentModel> {
        return document.populate({ path: 'districtId', populate: { path: 'provinceId' } }).execPopulate();
    }

    /**
     * @param {VisualizationWardDocumentModel} input
     *
     * @return {VisualizationWardApiModel}
     */
    public convertToApiResponse({
        _id,
        name,
        code,
        districtId,
        cTime,
        mTime,
    }: VisualizationWardDocumentModel): VisualizationWardApiModel {
        let district: VisualizationDistrictApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualizationDistrictLogic.getInstance().convertToApiResponse(districtId);
            } else {
                district = districtId;
            }
        }

        return {
            id: _id ?? null,
            name: name ?? null,
            code: code ?? null,
            district,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}
