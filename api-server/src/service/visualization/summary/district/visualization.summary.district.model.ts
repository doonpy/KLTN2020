import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualizationSummaryDistrictDocumentModel } from './visualization.summary.district.interface';

autoIncrement.initialize(mongoose.connection);

const VisualizationSummaryDistrictSchema: Schema = new Schema(
    {
        districtId: { type: Schema.Types.Number, ref: 'visualization_district' },
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

VisualizationSummaryDistrictSchema.plugin(autoIncrement.plugin, {
    model: 'visualization_summary_district',
    startAt: 1,
    incrementBy: 1,
});

VisualizationSummaryDistrictSchema.index({ districtId: 1 }, { name: 'idx_districtId', unique: true });

export default mongoose.model<VisualizationSummaryDistrictDocumentModel>(
    'visualization_summary_district',
    VisualizationSummaryDistrictSchema
);
