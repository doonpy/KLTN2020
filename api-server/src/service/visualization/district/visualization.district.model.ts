import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualizationDistrictDocumentModel } from './visualization.district.interface';

autoIncrement.initialize(mongoose.connection);

export const VisualizationDistrictSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String },
        code: { type: Schema.Types.String },
        acreage: { type: Schema.Types.Number },
        provinceId: { type: Schema.Types.Number, ref: 'visualization_province' },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualizationDistrictSchema.plugin(autoIncrement.plugin, {
    model: 'visualization_district',
    startAt: 1,
    incrementBy: 1,
});

VisualizationDistrictSchema.index({ name: 1 }, { name: 'idx_name' });
VisualizationDistrictSchema.index({ provinceId: 1 }, { name: 'idx_provinceId' });

export default mongoose.model<VisualizationDistrictDocumentModel>(
    'visualization_district',
    VisualizationDistrictSchema
);
