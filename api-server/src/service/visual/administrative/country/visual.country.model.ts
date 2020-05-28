import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualCountryDocumentModel } from './visual.country.interface';

autoIncrement.initialize(mongoose.connection);

const VisualCountrySchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String },
        code: { type: Schema.Types.String },
        acreage: { type: Schema.Types.Number },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualCountrySchema.plugin(autoIncrement.plugin, {
    model: 'visual_administrative_country',
    startAt: 1,
    incrementBy: 1,
});

VisualCountrySchema.index({ name: 1 }, { name: 'idx_name' });

export default mongoose.model<VisualCountryDocumentModel>('visual_administrative_country', VisualCountrySchema);
