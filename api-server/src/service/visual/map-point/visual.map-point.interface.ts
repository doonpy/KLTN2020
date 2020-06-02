import {
    CommonApiModel,
    CommonDocumentModel,
} from '@common/service/common.service.interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from '../administrative/district/visual.administrative.district.interface';
import {
    VisualAdministrativeWardApiModel,
    VisualAdministrativeWardDocumentModel,
} from '../administrative/ward/visual.administrative.ward.interface';

export interface MapPoint {
    rawDataId: number;
    acreage: number;
    price: number;
    currency: string;
    timeUnit?: string[];
}

export interface VisualMapPointDocumentModel extends CommonDocumentModel {
    districtId: number | VisualAdministrativeDistrictDocumentModel;
    wardId: number | VisualAdministrativeWardDocumentModel;
    lat: number;
    lng: number;
    points: {
        rawDataset: MapPoint[];
        transactionType: number;
        propertyType: number;
    }[];
}

export interface VisualMapPointApiModel extends CommonApiModel {
    district: number | VisualAdministrativeDistrictApiModel | null;
    ward: number | VisualAdministrativeWardApiModel | null;
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
