import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualAdministrativeCountryDocumentModel } from './interface';

autoIncrement.initialize(mongoose.connection);

const VisualAdministrativeCountrySchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        code: { type: Schema.Types.String, required: true },
        acreage: { type: Schema.Types.Number, required: true },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualAdministrativeCountrySchema.plugin(autoIncrement.plugin, {
    model: 'visual_administrative_country',
    startAt: 1,
    incrementBy: 1,
});

VisualAdministrativeCountrySchema.index({ name: 1 }, { name: 'idx_name' });

const Model = mongoose.model<VisualAdministrativeCountryDocumentModel>(
    'visual_administrative_country',
    VisualAdministrativeCountrySchema
);

export default Model;
