import * as mongoose from 'mongoose';
import CatalogModelInterface from '../catalog/catalog.model.interface';
import DetailUrlModelInterface from '../detail-url/detail-url.model.interface';

export default interface PatternModelInterface extends mongoose.Document {
    _id: number;
    catalogId: CatalogModelInterface | number;
    sourceUrlId: DetailUrlModelInterface | number;
    mainLocator: {
        propertyType: string;
        title: string;
        price: string;
        acreage: string;
        address: string;
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
