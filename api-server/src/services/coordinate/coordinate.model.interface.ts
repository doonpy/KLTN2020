import * as mongoose from 'mongoose';

export default interface CoordinateModelInterface extends mongoose.Document {
    _id: number;
    location: string;
    lat: number;
    lng: number;
    cTime: string;
    mTime: string;
}
