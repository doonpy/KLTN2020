import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import CommonConstant from '@common/common.constant';
import { VisualAnalyticsDocumentModel } from '@service/visual/analytics/visual.analytics.interface';

autoIncrement.initialize(mongoose.connection);

const VisualAnalysisSchema: Schema = new Schema(
    {
        month: { type: Schema.Types.Number },
        year: { type: Schema.Types.Number },
        transactionType: {
            type: Schema.Types.Number,
            enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
        },
        propertyType: {
            type: Schema.Types.Number,
            enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
        },
        amount: { type: Schema.Types.Number },
        max: { type: Schema.Types.Number },
        min: { type: Schema.Types.Number },
        sumAverage: { type: Schema.Types.Number },
        average: { type: Schema.Types.Number },
        maxAverage: { type: Schema.Types.Number },
        minAverage: { type: Schema.Types.Number },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualAnalysisSchema.plugin(autoIncrement.plugin, {
    model: 'visual_analytics',
    startAt: 1,
    incrementBy: 1,
});

VisualAnalysisSchema.index({ month: 1 }, { name: 'idx_month' });
VisualAnalysisSchema.index({ year: 1 }, { name: 'idx_year' });
VisualAnalysisSchema.index(
    { transactionType: 1 },
    { name: 'idx_transactionType' }
);
VisualAnalysisSchema.index({ propertyType: 1 }, { name: 'idx_propertyType' });

const VisualAnalyticsModel = mongoose.model<VisualAnalyticsDocumentModel>(
    'visual_analytics',
    VisualAnalysisSchema
);

export default VisualAnalyticsModel;
