import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import CommonConstant from '@common/constant';
import { VisualAnalyticsDocumentModel } from '@service/visual/analytics/interface';

autoIncrement.initialize(mongoose.connection);

const VisualAnalyticsSchema: Schema = new Schema(
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

VisualAnalyticsSchema.plugin(autoIncrement.plugin, {
    model: 'visual_analytics',
    startAt: 1,
    incrementBy: 1,
});

VisualAnalyticsSchema.index({ month: 1 }, { name: 'idx_month' });
VisualAnalyticsSchema.index({ year: 1 }, { name: 'idx_year' });
VisualAnalyticsSchema.index(
    { transactionType: 1 },
    { name: 'idx_transactionType' }
);
VisualAnalyticsSchema.index({ propertyType: 1 }, { name: 'idx_propertyType' });

const Model = mongoose.model<VisualAnalyticsDocumentModel>(
    'visual_analytics',
    VisualAnalyticsSchema
);

export default Model;
