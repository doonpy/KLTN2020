import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { TempDocumentModel } from './temp.interface';

autoIncrement.initialize(mongoose.connection);

const tempSchema: Schema = new Schema(
    {
        rawDataId: { type: Schema.Types.Number },
        address: { type: Schema.Types.String },
        houseNumber: { type: Schema.Types.String },
        street: { type: Schema.Types.String },
        ward: { type: Schema.Types.String },
        district: { type: Schema.Types.String },
        province: { type: Schema.Types.String },
        country: { type: Schema.Types.String },
        lat: { type: Schema.Types.Number },
        lon: { type: Schema.Types.Number },
        isValid: { type: Schema.Types.Boolean },
        matchPercentage: { type: Schema.Types.Number },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

tempSchema.plugin(autoIncrement.plugin, {
    model: 'temp',
    startAt: 1,
    incrementBy: 1,
});

export default mongoose.model<TempDocumentModel>('temp', tempSchema);
