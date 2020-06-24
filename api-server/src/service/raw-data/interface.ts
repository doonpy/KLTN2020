import {
    ApiModelBase,
    CommonRequestBodySchema,
    CommonRequestParamSchema,
    CommonRequestQuerySchema,
    DocumentModelBase,
} from '@service/interface';
import {
    DetailUrlApiModel,
    DetailUrlDocumentModel,
} from '../detail-url/interface';
import {
    CoordinateApiModel,
    CoordinateDocumentModel,
} from '../coordinate/interface';
import { CatalogLocator } from '@service/catalog/interface';

export interface RawDataStatus {
    isSummary: boolean;
    isMapPoint: boolean;
    isAnalytics: boolean;
    isGrouped: boolean;
}

export interface RawDataPrice {
    value: number;
    currency: string;
    timeUnit?: number;
}

export interface RawDataAcreage {
    value: number;
    measureUnit: string;
}

export interface RawDataOther {
    name: string;
    value: string;
}

export interface RawDataApiModel extends ApiModelBase {
    detailUrl: DetailUrlApiModel | number | null;
    transactionType: { id: number; wording: string[] } | null;
    propertyType: { id: number; wording: string[] } | null;
    postDate: string | null;
    title: string | null;
    describe: string | null;
    price: RawDataPrice | null;
    acreage: RawDataAcreage | null;
    address: string | null;
    others: RawDataOther[] | null;
    coordinate: CoordinateApiModel | number | null;
}

export interface RawDataDocumentModel extends DocumentModelBase {
    detailUrlId: DetailUrlDocumentModel | number;
    transactionType: number;
    propertyType: number;
    postDate: string;
    title: string;
    describe: string;
    price: RawDataPrice;
    acreage: RawDataAcreage;
    address: string;
    others: RawDataOther[];
    coordinateId: CoordinateDocumentModel | number;
    status: RawDataStatus;
}

export interface RawDataRequestParamSchema extends CommonRequestParamSchema {}

export interface RawDataRequestQuerySchema extends CommonRequestQuerySchema {
    detailUrlId: string;
    transactionType: string;
    propertyType: string;
    title: string;
    describe: string;
    address: string;
}

export interface RawDataRequestBodySchema extends CommonRequestBodySchema {
    detailUrlId: number;
    transactionType: number;
    propertyType: number;
    postDate: string;
    title: string;
    describe: string;
    price: RawDataPrice;
    acreage: RawDataAcreage;
    address: string;
    others: RawDataOther[];
    coordinateId: number;
    status: RawDataStatus;
}
