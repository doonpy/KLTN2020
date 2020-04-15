import * as mongoose from 'mongoose';
import HostModelInterface from '../host/host.model.interface';
import PatternModelInterface from '../pattern/pattern.model.interface';

export default interface CatalogModelInterface extends mongoose.Document {
    _id: number;
    title: string;
    url: string;
    locator: {
        detailUrl: string;
        pageNumber: string;
    };
    hostId: HostModelInterface | number;
    patternId: PatternModelInterface | number;
    cTime: string;
    mTime: string;
}
