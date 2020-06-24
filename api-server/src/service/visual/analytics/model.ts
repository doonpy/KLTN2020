import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import CommonConstant from '@common/constant';
import { VisualAnalyticsDocumentModel } from '@service/visual/analytics/interface';

autoIncrement.initialize(mongoose.connection);

const VisualAnalyticsSchema: Schema = new Schema(
    {
        month: { type: Schema.Types.Number, required: true },
        year: { type: Schema.Types.Number, required: true },
        transactionType: {
            type: Schema.Types.Number,
            enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
            required: true,
        },
        propertyType: {
            type: Schema.Types.Number,
            enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
            required: true,
        },
        amount: { type: Schema.Types.Number, required: true },
        priceMax: { type: Schema.Types.Number, required: true },
        priceMin: { type: Schema.Types.Number, required: true },
        perMeterSum: { type: Schema.Types.Number, required: true },
        perMeterAverage: { type: Schema.Types.Number, required: true },
        perMeterMax: { type: Schema.Types.Number, required: true },
        perMeterMin: { type: Schema.Types.Number, required: true },
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
