import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import autoPopulate from 'mongoose-autopopulate';
import { VisualAdministrativeDistrictDocumentModel } from './interface';

autoIncrement.initialize(mongoose.connection);

const VisualAdministrativeDistrictSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        code: { type: Schema.Types.String, required: true },
        acreage: { type: Schema.Types.Number, required: true },
        provinceId: {
            type: Schema.Types.Number,
            ref: 'visual_administrative_province',
            autopopulate: true,
            required: true,
        },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualAdministrativeDistrictSchema.plugin(autoIncrement.plugin, {
    model: 'visual_administrative_district',
    startAt: 1,
    incrementBy: 1,
});
VisualAdministrativeDistrictSchema.plugin(autoPopulate);

VisualAdministrativeDistrictSchema.index({ name: 1 }, { name: 'idx_name' });
VisualAdministrativeDistrictSchema.index(
    { provinceId: 1 },
    { name: 'idx_provinceId' }
);

const Model = mongoose.model<VisualAdministrativeDistrictDocumentModel>(
    'visual_administrative_district',
    VisualAdministrativeDistrictSchema
);

export default Model;
