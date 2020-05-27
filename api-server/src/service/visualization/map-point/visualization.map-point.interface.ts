import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';
import {
    VisualizationDistrictApiModel,
    VisualizationDistrictDocumentModel,
} from '../administrative/district/visualization.district.interface';
import {
    VisualizationWardApiModel,
    VisualizationWardDocumentModel,
} from '../administrative/ward/visualization.ward.interface';
import { VisualizationCommonLogicInterface } from '../visualization.common.interface';

export interface VisualizationMapPointDocumentModel extends CommonDocumentModel {
    districtId: number | VisualizationDistrictDocumentModel;
    wardId: number | VisualizationWardDocumentModel;
    lat: number;
    lng: number;
    points: {
        rawDataset: { rawDataId: number; acreage: number }[];
        transactionType: number;
        propertyType: number;
    }[];
}

export interface VisualizationMapPointApiModel extends CommonApiModel {
    district: number | VisualizationDistrictApiModel | null;
    ward: number | VisualizationWardApiModel | null;
    lat: number | null;
    lng: number | null;
    points:
        | {
              rawDataset: { rawDataId: number; acreage: number }[];
              transactionType: number;
              propertyType: number;
          }[]
        | null;
}

export interface VisualizationMapPointLogicInterface extends VisualizationCommonLogicInterface {
    /**
     * @param {VisualizationMapPointDocumentModel} document
     *
     * @return {VisualizationMapPointDocumentModel}
     */
    populateDocument(document: VisualizationMapPointDocumentModel): Promise<VisualizationMapPointDocumentModel>;
}
