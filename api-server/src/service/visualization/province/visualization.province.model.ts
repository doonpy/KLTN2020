import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualizationProvinceDocumentModel } from './visualization.province.interface';

autoIncrement.initialize(mongoose.connection);

export const VisualizationProvinceSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String },
        code: { type: Schema.Types.String },
        acreage: { type: Schema.Types.Number },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualizationProvinceSchema.plugin(autoIncrement.plugin, {
    model: 'visualization_province',
    startAt: 1,
    incrementBy: 1,
});

VisualizationProvinceSchema.index({ name: 1 }, { name: 'idx_name' });

export default mongoose.model<VisualizationProvinceDocumentModel>(
    'visualization_province',
    VisualizationProvinceSchema
);
