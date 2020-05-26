import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualizationMapPointDocumentModel } from './visualization.map-point.interface';
import CommonConstant from '../../../common/common.constant';

autoIncrement.initialize(mongoose.connection);

const VisualizationMapPointSchema: Schema = new Schema(
    {
        districtId: { type: Schema.Types.Number, ref: 'visual_administrative_district' },
        wardId: { type: Schema.Types.Number, ref: 'visual_administrative_ward' },
        lat: { type: Schema.Types.Number },
        lng: { type: Schema.Types.Number },
        points: [
            {
                _id: false,
                rawDataset: [
                    {
                        _id: false,
                        rawDataId: { type: Schema.Types.Number, ref: 'raw_data' },
                        acreage: { type: Schema.Types.Number },
                    },
                ],
                transactionType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.TRANSACTION_TYPE.map((item) => item.id),
                },
                propertyType: { type: Schema.Types.Number, enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id) },
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualizationMapPointSchema.plugin(autoIncrement.plugin, {
    model: 'visual_map_point',
    startAt: 1,
    incrementBy: 1,
});

VisualizationMapPointSchema.index(
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
            'idx_lat_lon_transactionType_propertyType_points.rawDataset.acreage_points.transactionType_points.propertyType',
    }
);

export default mongoose.model<VisualizationMapPointDocumentModel>('visual_map_point', VisualizationMapPointSchema);
