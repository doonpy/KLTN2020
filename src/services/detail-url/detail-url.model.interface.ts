import * as mongoose from 'mongoose';
import { Catalog } from '../catalog/catalog.index';

export default interface DetailUrlModelInterface extends mongoose.Document {
    _id: number;
    catalogId: Catalog.DocumentInterface | number;
    url: string;
    isExtracted: boolean;
    requestRetries: number;
    cTime: string;
    mTime: string;
}
