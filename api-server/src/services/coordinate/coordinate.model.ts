import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import CoordinateModelInterface from './coordinate.model.interface';

autoIncrement.initialize(mongoose.connection);

const CoordinateCacheSchema: Schema = new Schema(
    {
        location: Schema.Types.String,
        lat: Schema.Types.Number,
        lng: Schema.Types.Number,
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

CoordinateCacheSchema.plugin(autoIncrement.plugin, {
    model: 'coordinate',
    startAt: 1,
    incrementBy: 1,
});

CoordinateCacheSchema.index({ location: 1 });

export default mongoose.model<CoordinateModelInterface>('coordinate', CoordinateCacheSchema);
