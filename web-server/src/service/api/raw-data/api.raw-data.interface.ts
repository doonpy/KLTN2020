import { CommonApiModel, CommonQueryParams } from '../../common/service/common.service.interface';
import { DetailUrlApiModel } from '../detail-url/api.detail-url.interface';

export interface RawDataQueryParams extends CommonQueryParams {
    detailUrlId?: number;
    transactionType?: number;
    propertyType?: number;
    title?: string;
    describe?: string;
    address?: string;
    isGrouped?: 0 | 1;
}

export interface CoordinateApiModel extends CommonApiModel {
    location: string | null;
    lat: number | null;
    lng: number | null;
}

export interface RawDataApiModel extends CommonApiModel {
    detailUrl: DetailUrlApiModel | number | null;
    transactionType: { id: number; wording: string[] } | null;
    propertyType: { id: number; wording: string[] } | null;
    postDate: string | null;
    title: string | null;
    describe: string | null;
    price: {
        value: number | null;
        currency: string | null;
    } | null;
    acreage: {
        value: number | null;
        measureUnit: string | null;
    } | null;
    address: string | null;
    others:
        | [
              {
                  name: string | null;
                  value: string | null;
              }
          ]
        | []
        | null;
    coordinate: CoordinateApiModel | number | null;
    isGrouped: boolean | null;
}
