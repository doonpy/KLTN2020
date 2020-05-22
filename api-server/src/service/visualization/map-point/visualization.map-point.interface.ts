import { CommonApiModel, CommonDocumentModel } from '../../../common/service/common.service.interface';
import {
    VisualizationDistrictApiModel,
    VisualizationDistrictDocumentModel,
} from '../district/visualization.district.interface';
import { VisualizationWardApiModel, VisualizationWardDocumentModel } from '../ward/visualization.ward.interface';
import { RawDataApiModel, RawDataDocumentModel } from '../../raw-data/raw-data.interface';
import { VisualizationCommonLogicInterface } from '../visualization.common.interface';

export interface VisualizationMapPointDocumentModel extends CommonDocumentModel {
    districtId: number | VisualizationDistrictDocumentModel;
    wardId: number | VisualizationWardDocumentModel;
    lat: number;
    lng: number;
    rawDataList: { rawDataId: number | RawDataDocumentModel; acreage: number }[];
}

export interface VisualizationMapPointApiModel extends CommonApiModel {
    district: number | VisualizationDistrictApiModel | null;
    ward: number | VisualizationWardApiModel | null;
    lat: number | null;
    lng: number | null;
    rawDataList: { rawDataId: number | RawDataApiModel; acreage: number }[] | null;
}

export interface VisualizationMapPointLogicInterface extends VisualizationCommonLogicInterface {
    /**
     * @param {VisualizationMapPointDocumentModel} document
     *
     * @return {VisualizationMapPointDocumentModel}
     */
    populateDocument(document: VisualizationMapPointDocumentModel): Promise<VisualizationMapPointDocumentModel>;
}
