import {
    VisualizationMapPointApiModel,
    VisualizationMapPointDocumentModel,
    VisualizationMapPointLogicInterface,
} from './visualization.map-point.interface';
import { VisualizationDistrictApiModel } from '../district/visualization.district.interface';
import VisualizationDistrictLogic from '../district/visualization.district.logic';
import { VisualizationWardApiModel } from '../ward/visualization.ward.interface';
import VisualizationWardLogic from '../ward/visualization.ward.logic';
import RawDataLogic from '../../raw-data/raw-data.logic';
import { RawDataApiModel } from '../../raw-data/raw-data.interface';

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
        rawDataList,
        cTime,
        mTime,
    }: VisualizationMapPointDocumentModel): VisualizationMapPointApiModel {
        let district: VisualizationDistrictApiModel | number | null = null;
        let ward: VisualizationWardApiModel | number | null = null;
        let rawDataListResult: { rawDataId: number | RawDataApiModel; acreage: number }[] | null = null;

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

        if (rawDataList) {
            rawDataListResult = rawDataList.map(({ acreage, rawDataId }): {
                rawDataId: number | RawDataApiModel;
                acreage: number;
            } => {
                if (typeof rawDataId === 'object') {
                    return { rawDataId: RawDataLogic.getInstance().convertToApiResponse(rawDataId), acreage };
                }

                return { rawDataId, acreage };
            });
        }

        return {
            id: _id ?? null,
            district,
            ward,
            lat,
            lng,
            rawDataList: rawDataListResult,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}
