import * as mongoose from 'mongoose';
import RawDataModelInterface from '../raw-data/raw-data.model.interface';

export default interface GroupedDataModelInterface extends mongoose.Document {
    _id: number;
    items: (RawDataModelInterface | number)[];
    cTime: string;
    mTime: string;
}
