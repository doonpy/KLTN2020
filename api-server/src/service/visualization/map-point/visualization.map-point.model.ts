import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualizationMapPointDocumentModel } from './visualization.map-point.interface';

autoIncrement.initialize(mongoose.connection);

const VisualizationMapPointSchema: Schema = new Schema(
    {
        districtId: { type: Schema.Types.Number, ref: 'visualization_district' },
        wardId: { type: Schema.Types.Number, ref: 'visualization_ward' },
        lat: { type: Schema.Types.Number },
        lon: { type: Schema.Types.Number },
        rawDataIdList: [{ type: Schema.Types.Number, ref: 'raw_data' }],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualizationMapPointSchema.plugin(autoIncrement.plugin, {
    model: 'visualization_map_point',
    startAt: 1,
    incrementBy: 1,
});

VisualizationMapPointSchema.index({ lat: 1, lon: 1 }, { name: 'idx_lat_lon' });

export default mongoose.model<VisualizationMapPointDocumentModel>(
    'visualization_map_point',
    VisualizationMapPointSchema
);
