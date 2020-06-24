import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { CoordinateDocumentModel } from './interface';

autoIncrement.initialize(mongoose.connection);

const CoordinateCacheSchema: Schema = new Schema(
    {
        locations: [Schema.Types.String],
        lat: { type: Schema.Types.Number, required: true },
        lng: { type: Schema.Types.Number, required: true },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

CoordinateCacheSchema.plugin(autoIncrement.plugin, {
    model: 'coordinate',
    startAt: 1,
    incrementBy: 1,
});

CoordinateCacheSchema.index({ location: 1 }, { name: 'idx_location' });

const Model = mongoose.model<CoordinateDocumentModel>(
    'coordinate',
    CoordinateCacheSchema
);

export default Model;
