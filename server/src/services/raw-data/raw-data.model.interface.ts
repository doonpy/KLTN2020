import * as mongoose from 'mongoose';
import { DetailUrl } from '../detail-url/detail-url.index';
import { Coordinate } from '../coordinate/coordinate.index';

export default interface RawDataModelInterface extends mongoose.Document {
    _id: number;
    detailUrlId: DetailUrl.DocumentInterface | number;
    transactionType: number;
    propertyType: number;
    postDate: string;
    title: string;
    price: {
        value: string;
        currency: string;
    };
    acreage: {
        value: string;
        measureUnit: string;
    };
    address: string;
    others: [
        {
            name: string;
            value: string;
        }
    ];
    coordinate: Coordinate.DocumentInterface | number;
    isGrouped: boolean;
    cTime: string;
    mTime: string;
}
