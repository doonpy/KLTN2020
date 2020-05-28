import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualWardDocumentModel } from './visual.ward.interface';

autoIncrement.initialize(mongoose.connection);

const VisualWardSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String },
        code: { type: Schema.Types.String },
        districtId: { type: Schema.Types.Number, ref: 'visual_administrative_district' },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualWardSchema.plugin(autoIncrement.plugin, {
    model: 'visual_administrative_ward',
    startAt: 1,
    incrementBy: 1,
});

VisualWardSchema.index({ name: 1 }, { name: 'idx_name' });
VisualWardSchema.index({ districtId: 1 }, { name: 'idx_districtId' });

export default mongoose.model<VisualWardDocumentModel>('visual_administrative_ward', VisualWardSchema);
