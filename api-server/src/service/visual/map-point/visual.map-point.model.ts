import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import autoPopulate from 'mongoose-autopopulate';
import CommonConstant from '@common/common.constant';
import { VisualMapPointDocumentModel } from './visual.map-point.interface';

autoIncrement.initialize(mongoose.connection);

const VisualMapPointSchema: Schema = new Schema(
    {
        districtId: {
            type: Schema.Types.Number,
            ref: 'visual_administrative_district',
            autopopulate: true,
        },
        wardId: {
            type: Schema.Types.Number,
            ref: 'visual_administrative_ward',
            autopopulate: true,
        },
        lat: { type: Schema.Types.Number },
        lng: { type: Schema.Types.Number },
        points: [
            {
                _id: false,
                rawDataset: [
                    {
                        _id: false,
                        rawDataId: {
                            type: Schema.Types.Number,
                            ref: 'raw_data',
                        },
                        acreage: { type: Schema.Types.Number },
                        price: { type: Schema.Types.Number },
                        currency: { type: Schema.Types.String },
                        timeUnit: [{ type: Schema.Types.String }],
                    },
                ],
                transactionType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.TRANSACTION_TYPE.map(
                        (item) => item.id
                    ),
                },
                propertyType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
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

const VisualMapPointModel = mongoose.model<VisualMapPointDocumentModel>(
    'visual_map_point',
    VisualMapPointSchema
);

export default VisualMapPointModel;
