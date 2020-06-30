import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import autoPopulate from 'mongoose-autopopulate';
import { VisualAdministrativeProvinceDocumentModel } from './interface';

autoIncrement.initialize(mongoose.connection);

const VisualAdministrativeProvinceSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        code: { type: Schema.Types.String, required: true },
        countryId: {
            type: Schema.Types.Number,
            ref: 'visual_administrative_country',
            autopopulate: true,
            required: true,
        },
        acreage: { type: Schema.Types.Number, required: true },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualAdministrativeProvinceSchema.plugin(autoIncrement.plugin, {
    model: 'visual_administrative_province',
    startAt: 1,
    incrementBy: 1,
});
VisualAdministrativeProvinceSchema.plugin(autoPopulate);

VisualAdministrativeProvinceSchema.index({ name: 1 }, { name: 'idx_name' });

const Model = mongoose.model<VisualAdministrativeProvinceDocumentModel>(
    'visual_administrative_province',
    VisualAdministrativeProvinceSchema
);

export default Model;
