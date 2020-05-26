import {
    VisualizationMapPointApiModel,
    VisualizationMapPointDocumentModel,
    VisualizationMapPointLogicInterface,
} from './visualization.map-point.interface';
import { VisualizationDistrictApiModel } from '../administrative/district/visualization.district.interface';
import VisualizationDistrictLogic from '../administrative/district/visualization.district.logic';
import { VisualizationWardApiModel } from '../administrative/ward/visualization.ward.interface';
import VisualizationWardLogic from '../administrative/ward/visualization.ward.logic';

export default class VisualizationMapPointLogic implements VisualizationMapPointLogicInterface {
    public static instance: VisualizationMapPointLogic;

    /**
     * @return {VisualizationMapPointLogic}
     */
    public static getInstance(): VisualizationMapPointLogic {
        if (!this.instance) {
            this.instance = new VisualizationMapPointLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualizationMapPointDocumentModel} document
     *
     * @return {VisualizationMapPointDocumentModel}
     */
    public async populateDocument(
        document: VisualizationMapPointDocumentModel
    ): Promise<VisualizationMapPointDocumentModel> {
        return document.populate('districtId wardId').execPopulate();
    }

    /**
     * @param {VisualizationMapPointDocumentModel} input
     *
     * @return {VisualizationMapPointApiModel}
     */
    public convertToApiResponse({
        _id,
        districtId,
        wardId,
        lat,
        lng,
        points,
        cTime,
        mTime,
    }: VisualizationMapPointDocumentModel): VisualizationMapPointApiModel {
        let district: VisualizationDistrictApiModel | number | null = null;
        let ward: VisualizationWardApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualizationDistrictLogic.getInstance().convertToApiResponse(districtId);
            } else {
                district = districtId;
            }
        }

        if (wardId) {
            if (typeof wardId === 'object') {
                ward = VisualizationWardLogic.getInstance().convertToApiResponse(wardId);
            } else {
                ward = wardId;
            }
        }

        return {
            id: _id ?? null,
            district,
            ward,
            lat,
            lng,
            points,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}
