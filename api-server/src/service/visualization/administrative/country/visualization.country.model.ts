import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualizationCountryDocumentModel } from './visualization.country.interface';

autoIncrement.initialize(mongoose.connection);

const VisualizationCountrySchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String },
        code: { type: Schema.Types.String },
        acreage: { type: Schema.Types.Number },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualizationCountrySchema.plugin(autoIncrement.plugin, {
    model: 'visual_administrative_country',
    startAt: 1,
    incrementBy: 1,
});

VisualizationCountrySchema.index({ name: 1 }, { name: 'idx_name' });

export default mongoose.model<VisualizationCountryDocumentModel>(
    'visual_administrative_country',
    VisualizationCountrySchema
);
