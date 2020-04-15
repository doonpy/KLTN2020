import * as mongoose from 'mongoose';

export default interface PatternModelInterface extends mongoose.Document {
    _id: number;
    sourceUrl: string;
    mainLocator: {
        propertyType: string;
        title: string;
        price: string;
        acreage: string;
        address: string;
        postDate: {
            locator: string;
            format: string;
            delimiter: string;
        };
    };
    subLocator: [
        {
            name: string;
            locator: string;
        }
    ];
    cTime: string;
    mTime: string;
}
