import { DetailUrl } from '../detail-url/detail-url.index';

export default interface RawDataApiInterface {
    id: number | null;
    detailUrl: DetailUrl.ApiInterface | null;
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
    createAt: string | null;
    updateAt: string | null;
}
