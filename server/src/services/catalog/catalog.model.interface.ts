import * as mongoose from 'mongoose';
import { Host } from '../host/host.index';
import { Pattern } from '../pattern/pattern.index';

export default interface CatalogModelInterface extends mongoose.Document {
    _id: number;
    title: string;
    url: string;
    locator: {
        detailUrl: string;
        pageNumber: string;
    };
    hostId: Host.DocumentInterface | number;
    patternId: Pattern.DocumentInterface | number;
    cTime: string;
    mTime: string;
}
