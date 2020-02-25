import * as mongoose from 'mongoose';

export default interface HostModelInterface extends mongoose.Document {
    _id: number;
    name: string;
    domain: string;
    cTime: string;
    mTime: string;
}
