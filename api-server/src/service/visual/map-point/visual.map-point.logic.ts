import {
    VisualMapPointApiModel,
    VisualMapPointDocumentModel,
    VisualMapPointLogicInterface,
} from './visual.map-point.interface';
import { VisualizationDistrictApiModel } from '../administrative/district/visual.district.interface';
import VisualDistrictLogic from '../administrative/district/visual.district.logic';
import { VisualWardApiModel } from '../administrative/ward/visual.ward.interface';
import VisualWardLogic from '../administrative/ward/visual.ward.logic';

export default class VisualMapPointLogic implements VisualMapPointLogicInterface {
    public static instance: VisualMapPointLogic;

    /**
     * @return {VisualMapPointLogic}
     */
    public static getInstance(): VisualMapPointLogic {
        if (!this.instance) {
            this.instance = new VisualMapPointLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualMapPointDocumentModel} document
     *
     * @return {VisualMapPointDocumentModel}
     */
    public async populateDocument(document: VisualMapPointDocumentModel): Promise<VisualMapPointDocumentModel> {
        return document.populate('districtId wardId').execPopulate();
    }

    /**
     * @param {VisualMapPointDocumentModel} input
     *
     * @return {VisualMapPointApiModel}
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
    }: VisualMapPointDocumentModel): VisualMapPointApiModel {
        let district: VisualizationDistrictApiModel | number | null = null;
        let ward: VisualWardApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualDistrictLogic.getInstance().convertToApiResponse(districtId);
            } else {
                district = districtId;
            }
        }

        if (wardId) {
            if (typeof wardId === 'object') {
                ward = VisualWardLogic.getInstance().convertToApiResponse(wardId);
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
