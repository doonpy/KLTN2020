import * as mongoose from 'mongoose';
import DetailUrlModelInterface from '../detail-url/detail-url.model.interface';

export default interface RawDataModelInterface extends mongoose.Document {
    _id: number;
    detailUrlId: DetailUrlModelInterface | number;
    transactionType: number;
    propertyType: number;
    title: string;
    price: {
        value: number;
        currency: string;
    };
    acreage: {
        value: number;
        measureUnit: string;
    };
    address: {
        city: string;
        district: string;
        ward: string;
        street: string;
        project: string;
    };
    others: [
        {
            name: string;
            value: string;
        }
    ];
    cTime: string;
    mTime: string;
}
