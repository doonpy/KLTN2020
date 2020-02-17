import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

const rawDataSchema = new Schema(
    {
        detailUrlId: {
            type: Schema.Types.Number,
            ref: 'detail_url',
        },
        title: { type: Schema.Types.String, default: '' },
        price: {
            value: { type: Schema.Types.Number, default: 0 },
            currency: { type: Schema.Types.String, default: '' },
        },
        acreage: {
            value: { type: Schema.Types.Number, default: 0 },
            measureUnit: { type: Schema.Types.String, default: 'm%B2' }, //decode unicode m²
        },
        address: {
            city: { type: Schema.Types.String, default: '' },
            district: { type: Schema.Types.String, default: '' },
            ward: { type: Schema.Types.String, default: '' },
            street: { type: Schema.Types.String, default: '' },
        },
        others: [
            {
                name: { type: Schema.Types.String, default: '' },
                value: { type: Schema.Types.String, default: '' },
                _id: false,
            },
        ],
        type: { type: Schema.Types.Number, enum: [] },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

rawDataSchema.plugin(autoIncrement.plugin, {
    model: 'raw_data',
    startAt: 1,
    incrementBy: 1,
});

export default mongoose.model('raw_data', rawDataSchema);
