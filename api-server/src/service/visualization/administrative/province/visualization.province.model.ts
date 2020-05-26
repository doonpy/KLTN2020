import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualizationProvinceDocumentModel } from './visualization.province.interface';

autoIncrement.initialize(mongoose.connection);

const VisualizationProvinceSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String },
        code: { type: Schema.Types.String },
        countryId: { type: Schema.Types.Number, ref: 'visual_administrative_country' },
        acreage: { type: Schema.Types.Number },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualizationProvinceSchema.plugin(autoIncrement.plugin, {
    model: 'visual_administrative_province',
    startAt: 1,
    incrementBy: 1,
});

VisualizationProvinceSchema.index({ name: 1 }, { name: 'idx_name' });

export default mongoose.model<VisualizationProvinceDocumentModel>(
    'visual_administrative_province',
    VisualizationProvinceSchema
);
