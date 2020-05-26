import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { VisualizationSummaryDistrictDocumentModel } from './visualization.summary.district.interface';
import CommonConstant from '../../../../common/common.constant';

autoIncrement.initialize(mongoose.connection);

const VisualizationSummaryDistrictSchema: Schema = new Schema(
    {
        districtId: { type: Schema.Types.Number, ref: 'visual_administrative_district' },
        summaryAmount: { type: Schema.Types.Number },
        summary: [
            {
                _id: false,
                transactionType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
                },
                propertyType: { type: Schema.Types.Number, enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id) },
                amount: { type: Schema.Types.Number },
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualizationSummaryDistrictSchema.plugin(autoIncrement.plugin, {
    model: 'visual_summary_district',
    startAt: 1,
    incrementBy: 1,
});

VisualizationSummaryDistrictSchema.index({ districtId: 1 }, { name: 'idx_districtId', unique: true });

export default mongoose.model<VisualizationSummaryDistrictDocumentModel>(
    'visual_summary_district',
    VisualizationSummaryDistrictSchema
);
