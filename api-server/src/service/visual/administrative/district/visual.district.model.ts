import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualDistrictDocumentModel } from './visual.district.interface';

autoIncrement.initialize(mongoose.connection);

const VisualDistrictSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String },
        code: { type: Schema.Types.String },
        acreage: { type: Schema.Types.Number },
        provinceId: { type: Schema.Types.Number, ref: 'visual_administrative_province' },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualDistrictSchema.plugin(autoIncrement.plugin, {
    model: 'visual_administrative_district',
    startAt: 1,
    incrementBy: 1,
});

VisualDistrictSchema.index({ name: 1 }, { name: 'idx_name' });
VisualDistrictSchema.index({ provinceId: 1 }, { name: 'idx_provinceId' });

export default mongoose.model<VisualDistrictDocumentModel>('visual_administrative_district', VisualDistrictSchema);
