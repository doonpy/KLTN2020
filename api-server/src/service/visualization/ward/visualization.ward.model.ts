import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualizationWardDocumentModel } from './visualization.ward.interface';

autoIncrement.initialize(mongoose.connection);

export const VisualizationWardSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String },
        code: { type: Schema.Types.String },
        districtId: { type: Schema.Types.Number, ref: 'visualization_district' },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualizationWardSchema.plugin(autoIncrement.plugin, {
    model: 'visualization_ward',
    startAt: 1,
    incrementBy: 1,
});

VisualizationWardSchema.index({ name: 1 }, { name: 'idx_name' });
VisualizationWardSchema.index({ districtId: 1 }, { name: 'idx_districtId' });

export default mongoose.model<VisualizationWardDocumentModel>('visualization_ward', VisualizationWardSchema);
