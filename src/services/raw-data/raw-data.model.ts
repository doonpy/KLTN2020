import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import RawDataModelInterface from './raw-data.model.interface';
import { RawDataConstant } from './raw-data.constant';

autoIncrement.initialize(mongoose.connection);

const rawDataSchema = new Schema(
    {
        detailUrlId: {
            type: Schema.Types.Number,
            ref: 'detail_url',
        },
        transactionType: {
            type: Schema.Types.Number,
            enum: [
                RawDataConstant.TYPE_OF_TRANSACTION.SALE,
                RawDataConstant.TYPE_OF_TRANSACTION.RENT,
            ],
        },
        propertyType: {
            type: Schema.Types.Number,
            enum: [
                RawDataConstant.TYPE_OF_PROPERTY.APARTMENT,
                RawDataConstant.TYPE_OF_PROPERTY.OFFICE,
                RawDataConstant.TYPE_OF_PROPERTY.OTHER,
                RawDataConstant.TYPE_OF_PROPERTY.ROOM,
                RawDataConstant.TYPE_OF_PROPERTY.SHOP,
                RawDataConstant.TYPE_OF_PROPERTY.FARM,
                RawDataConstant.TYPE_OF_PROPERTY.INDIVIDUAL_HOUSE,
                RawDataConstant.TYPE_OF_PROPERTY.LAND,
                RawDataConstant.TYPE_OF_PROPERTY.PROJECT_LAND,
                RawDataConstant.TYPE_OF_PROPERTY.RESORT,
                RawDataConstant.TYPE_OF_PROPERTY.TOWNHOUSE,
                RawDataConstant.TYPE_OF_PROPERTY.VILLA,
                RawDataConstant.TYPE_OF_PROPERTY.WAREHOUSE,
            ],
        },
        postDate: { type: Schema.Types.Date },
        title: { type: Schema.Types.String },
        price: {
            value: { type: Schema.Types.String },
            currency: { type: Schema.Types.String },
        },
        acreage: {
            value: { type: Schema.Types.String },
            measureUnit: { type: Schema.Types.String },
        },
        address: {
            city: { type: Schema.Types.String },
            district: { type: Schema.Types.String },
            ward: { type: Schema.Types.String },
            street: { type: Schema.Types.String },
            other: { type: Schema.Types.String },
        },
        others: [
            {
                name: { type: Schema.Types.String },
                value: { type: Schema.Types.String },
                _id: false,
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

rawDataSchema.plugin(autoIncrement.plugin, {
    model: 'raw_data',
    startAt: 1,
    incrementBy: 1,
});

export default mongoose.model<RawDataModelInterface>('raw_data', rawDataSchema);
