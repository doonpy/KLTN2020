import * as mongoose from 'mongoose';

export default interface cleanDataModelInterface extends mongoose.Document {
    _id: number;
}
