import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';
import {
    VisualDistrictApiModel,
    VisualDistrictDocumentModel,
} from '../administrative/district/visual.district.interface';
import { VisualWardApiModel, VisualWardDocumentModel } from '../administrative/ward/visual.ward.interface';
import { VisualCommonLogicInterface } from '../visual.common.interface';

export interface MapPoint {
    rawDataId: number;
    acreage: number;
    price: number;
    currency: string;
    timeUnit?: string[];
}

export interface VisualMapPointDocumentModel extends CommonDocumentModel {
    districtId: number | VisualDistrictDocumentModel;
    wardId: number | VisualWardDocumentModel;
    lat: number;
    lng: number;
    points: {
        rawDataset: MapPoint[];
        transactionType: number;
        propertyType: number;
    }[];
}

export interface VisualMapPointApiModel extends CommonApiModel {
    district: number | VisualDistrictApiModel | null;
    ward: number | VisualWardApiModel | null;
    lat: number | null;
    lng: number | null;
    points:
        | {
              rawDataset: MapPoint[];
              transactionType: number;
              propertyType: number;
          }[]
        | null;
}

export interface VisualMapPointLogicInterface extends VisualCommonLogicInterface {
    /**
     * @param {VisualMapPointDocumentModel} document
     *
     * @return {VisualMapPointDocumentModel}
     */
    populateDocument(document: VisualMapPointDocumentModel): Promise<VisualMapPointDocumentModel>;
}
