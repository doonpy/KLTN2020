import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import autoPopulate from 'mongoose-autopopulate';
import { VisualAdministrativeProvinceDocumentModel } from './visual.administrative.province.interface';

autoIncrement.initialize(mongoose.connection);

const VisualAdministrativeProvinceSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String },
        code: { type: Schema.Types.String },
        countryId: {
            type: Schema.Types.Number,
            ref: 'visual_administrative_country',
            autopopulate: true,
        },
        acreage: { type: Schema.Types.Number },
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

const VisualAdministrativeProvinceModel = mongoose.model<
    VisualAdministrativeProvinceDocumentModel
>('visual_administrative_province', VisualAdministrativeProvinceSchema);

export default VisualAdministrativeProvinceModel;
