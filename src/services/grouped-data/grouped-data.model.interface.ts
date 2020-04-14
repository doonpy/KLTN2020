import * as mongoose from 'mongoose';
import { RawData } from '../raw-data/raw-data.index';

export default interface GroupedDataModelInterface extends mongoose.Document {
    _id: number;
    items: Array<RawData.DocumentInterface | number>;
    cTime: string;
    mTime: string;
}
