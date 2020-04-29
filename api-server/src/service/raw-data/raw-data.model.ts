import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { RawDataDocumentModel } from './raw-data.interface';
import RawDataConstant from './raw-data.constant';

autoIncrement.initialize(mongoose.connection);

const rawDataSchema = new Schema(
    {
        detailUrlId: {
            type: Schema.Types.Number,
            ref: 'detail_url',
        },
        transactionType: {
            type: Schema.Types.Number,
            enum: RawDataConstant.TRANSACTION_TYPE.map((item) => item.id),
        },
        propertyType: {
            type: Schema.Types.Number,
            enum: RawDataConstant.PROPERTY_TYPE.map((item) => item.id),
        },
        postDate: { type: Schema.Types.Date },
        title: { type: Schema.Types.String },
        describe: { type: Schema.Types.String },
        price: {
            value: { type: Schema.Types.Number },
            currency: { type: Schema.Types.String },
        },
        acreage: {
            value: { type: Schema.Types.Number },
            measureUnit: { type: Schema.Types.String },
        },
        address: { type: Schema.Types.String },
        others: [
            {
                name: { type: Schema.Types.String },
                value: { type: Schema.Types.String },
                _id: false,
            },
        ],
        coordinate: { type: Schema.Types.Number, ref: 'coordinate' },
        isGrouped: { type: Schema.Types.Boolean, default: false },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

rawDataSchema.plugin(autoIncrement.plugin, {
    model: 'raw_data',
    startAt: 1,
    incrementBy: 1,
});

rawDataSchema.index({ isGrouped: 1 }, { name: 'idx_isGrouped' });
rawDataSchema.index({ detailUrlId: 1 }, { name: 'idx_detailUrlId' });
rawDataSchema.index({ transactionType: 1 }, { name: 'idx_transactionType' });
rawDataSchema.index({ propertyType: 1 }, { name: 'idx_propertyType' });
rawDataSchema.index({ coordinate: 1 }, { name: 'idx_coordinate' });
rawDataSchema.index(
    { isGrouped: 1, propertyType: 1, transactionType: 1 },
    { name: 'idx_isGrouped_propertyType_transactionType' }
);

export default mongoose.model<RawDataDocumentModel>('raw_data', rawDataSchema);
