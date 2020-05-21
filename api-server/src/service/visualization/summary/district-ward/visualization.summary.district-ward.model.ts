import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualizationSummaryDistrictWardDocumentModel } from './visualization.summary.district-ward.interface';

autoIncrement.initialize(mongoose.connection);

const VisualizationSummaryDistrictWardSchema: Schema = new Schema(
    {
        districtId: { type: Schema.Types.Number, ref: 'visualization_district' },
        wardId: { type: Schema.Types.Number, ref: 'visualization_ward' },
        summaryAmount: { type: Schema.Types.Number },
        summary: [
            {
                _id: false,
                transactionType: { type: Schema.Types.Number },
                propertyType: { type: Schema.Types.Number },
                amount: { type: Schema.Types.Number },
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualizationSummaryDistrictWardSchema.plugin(autoIncrement.plugin, {
    model: 'visualization_summary_district_ward',
    startAt: 1,
    incrementBy: 1,
});

VisualizationSummaryDistrictWardSchema.index(
    { districtId: 1, wardId: 1 },
    { name: 'idx_districtId_wardId', unique: true }
);

export default mongoose.model<VisualizationSummaryDistrictWardDocumentModel>(
    'visualization_summary_district_ward',
    VisualizationSummaryDistrictWardSchema
);
