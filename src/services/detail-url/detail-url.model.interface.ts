import * as mongoose from 'mongoose';
import CatalogModelInterface from '../catalog/catalog.model.interface';

export default interface DetailUrlModelInterface extends mongoose.Document {
    _id: number;
    catalogId: CatalogModelInterface | number;
    url: string;
    isExtracted: boolean;
    requestRetries: number;
    cTime: string;
    mTime: string;
}
