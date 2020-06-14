import { ApiModelBase, DocumentModelBase } from '@service/interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from '../administrative/district/interface';
import {
    VisualAdministrativeWardApiModel,
    VisualAdministrativeWardDocumentModel,
} from '../administrative/ward/interface';

export interface MapPoint {
    rawDataId: number;
    acreage: number;
    price: number;
    currency: string;
    timeUnit?: string[];
}

export interface VisualMapPointDocumentModel extends DocumentModelBase {
    districtId: number | VisualAdministrativeDistrictDocumentModel;
    wardId: number | VisualAdministrativeWardDocumentModel;
    lat: number;
    lng: number;
    points: Array<{
        rawDataset: MapPoint[];
        transactionType: number;
        propertyType: number;
    }>;
}

export interface VisualMapPointApiModel extends ApiModelBase {
    district: number | VisualAdministrativeDistrictApiModel | null;
    ward: number | VisualAdministrativeWardApiModel | null;
    lat: number | null;
    lng: number | null;
    points: Array<{
        rawDataset: MapPoint[];
        transactionType: number;
        propertyType: number;
    }> | null;
}