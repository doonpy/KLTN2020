import DetailUrlApiInterface from '../detail-url/detail-url.api.interface';
import CoordinateApiInterface from '../coordinate/coordinate.api.interface';

export default interface RawDataApiInterface {
    id: number | null;
    detailUrl: DetailUrlApiInterface | null | number;
    transactionType: string | null;
    propertyType: string | null;
    postDate: string | null;
    title: string | null;
    price: {
        value: string;
        currency: string;
    } | null;
    acreage: {
        value: string;
        measureUnit: string;
    } | null;
    address: string | null;
    others:
        | [
              {
                  name: string;
                  value: string;
              }
          ]
        | []
        | null;
    coordinate: CoordinateApiInterface | null;
    isGrouped: boolean | null;
    createAt: string | null;
    updateAt: string | null;
}
