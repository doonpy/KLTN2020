import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import autoPopulate from 'mongoose-autopopulate';
import CommonConstant from '@common/constant';
import { VisualMapPointDocumentModel } from './interface';

autoIncrement.initialize(mongoose.connection);

const VisualMapPointSchema: Schema = new Schema(
    {
        districtId: {
            type: Schema.Types.Number,
            ref: 'visual_administrative_district',
            autopopulate: true,
            required: true,
        },
        wardId: {
            type: Schema.Types.Number,
            ref: 'visual_administrative_ward',
            autopopulate: true,
            required: true,
        },
        lat: { type: Schema.Types.Number, required: true },
        lng: { type: Schema.Types.Number, required: true },
        points: [
            {
                _id: false,
                rawDataset: [
                    {
                        _id: false,
                        rawDataId: {
                            type: Schema.Types.Number,
                            ref: 'raw_data',
                            required: true,
                        },
                        acreage: { type: Schema.Types.Number, required: true },
                        price: { type: Schema.Types.Number, required: true },
                        currency: { type: Schema.Types.String, required: true },
                        timeUnit: [
                            { type: Schema.Types.String, required: true },
                        ],
                    },
                ],
                transactionType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.TRANSACTION_TYPE.map(
                        (item) => item.id
                    ),
                    required: true,
                },
                propertyType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
                    required: true,
                },
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualMapPointSchema.plugin(autoIncrement.plugin, {
    model: 'visual_map_point',
    startAt: 1,
    incrementBy: 1,
});
VisualMapPointSchema.plugin(autoPopulate);

VisualMapPointSchema.index(
    { lat: 1, lng: 1 },
    { name: 'idx_lat_lon', unique: true }
);
VisualMapPointSchema.index(
    {
        lat: 1,
        lng: 1,
        transactionType: 1,
        propertyType: 1,
        'points.rawDataset.acreage': 1,
        'points.transactionType': 1,
        'points.propertyType': 1,
    },
    {
        name:
            'idx_points.rawDataset.acreage_points.transactionType_points.propertyType',
    }
);

const Model = mongoose.model<VisualMapPointDocumentModel>(
    'visual_map_point',
    VisualMapPointSchema
);

export default Model;
