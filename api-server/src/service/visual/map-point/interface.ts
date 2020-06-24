import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from '../administrative/district/interface';
import {
    VisualAdministrativeWardApiModel,
    VisualAdministrativeWardDocumentModel,
} from '../administrative/ward/interface';

export interface RawDatasetItem {
    rawDataId: number;
    acreage: number;
    price: number;
    currency: string;
    timeUnit?: string[];
}

export interface Point {
    rawDataset: RawDatasetItem[];
    transactionType: number;
    propertyType: number;
}

export interface VisualMapPointDocumentModel extends DocumentModelBase {
    districtId: number | VisualAdministrativeDistrictDocumentModel;
    wardId: number | VisualAdministrativeWardDocumentModel;
    lat: number;
    lng: number;
    points: Point[];
}

export interface VisualMapPointApiModel extends ApiModelBase {
    district: number | VisualAdministrativeDistrictApiModel | null;
    ward: number | VisualAdministrativeWardApiModel | null;
    lat: number | null;
    lng: number | null;
    points: Point[] | null;
}

export interface VisualMapPointRequestParamSchema
    extends CommonRequestParamSchema {}

export interface VisualMapPointRequestQuerySchema
    extends CommonRequestQuerySchema {
    minLat: string;
    maxLat: string;
    minLng: string;
    maxLng: string;
    minAcreage: string;
    maxAcreage: string;
    minPrice: string;
    maxPrice: string;
    transactionType: string;
    propertyType: string;
}

export interface VisualMapPointRequestBodySchema
    extends CommonRequestBodySchema {
    districtId: number;
    wardId: number;
    lat: number;
    lng: number;
    points: Point[];
}
