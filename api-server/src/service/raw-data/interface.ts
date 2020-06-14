import {
    ApiModelBase,
    DocumentModelBase,
    CommonLogicBaseInterface,
} from '@service/interface';
import {
    DetailUrlApiModel,
    DetailUrlDocumentModel,
} from '../detail-url/interface';
import {
    CoordinateApiModel,
    CoordinateDocumentModel,
} from '../coordinate/interface';

export interface RawDataApiModel extends ApiModelBase {
    detailUrl: DetailUrlApiModel | number | null;
    transactionType: { id: number; wording: string[] } | null;
    propertyType: { id: number; wording: string[] } | null;
    postDate: string | null;
    title: string | null;
    describe: string | null;
    price: {
        value: number | null;
        currency: string | null;
        timeUnit: { id: number; wording: string[] } | null;
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
}

export interface RawDataDocumentModel extends DocumentModelBase {
    detailUrlId: DetailUrlDocumentModel | number;
    transactionType: number;
    propertyType: number;
    postDate: string;
    title: string;
    describe: string;
    price: {
        value: number;
        currency: string;
        timeUnit: number;
    };
    acreage: {
        value: number;
        measureUnit: string;
    };
    address: string;
    others: [
        {
            name: string;
            value: string;
        }
    ];
    coordinateId: CoordinateDocumentModel | number;
    status: {
        isSummary: boolean;
        isMapPoint: boolean;
        isAnalytics: boolean;
        isGrouped: boolean;
    };
}

export interface RawDataLogicInterface
    extends CommonLogicBaseInterface<RawDataDocumentModel, RawDataApiModel> {
    getPropertyTypeIndex(propertyTypeData: string): number;

    countDocumentsWithConditions(conditions?: object): Promise<number>;
}
