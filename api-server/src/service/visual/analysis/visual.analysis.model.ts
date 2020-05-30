import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import CommonConstant from '@common/common.constant';
import { VisualAnalysisDocumentModel } from '@service/visual/analysis/visual.analysis.interface';

autoIncrement.initialize(mongoose.connection);

const VisualAnalysisSchema: Schema = new Schema(
    {
        referenceDate: { type: Schema.Types.Date },
        priceAnalysisData: [
            {
                _id: false,
                transactionType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
                },
                propertyType: { type: Schema.Types.Number, enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id) },
                summary: { type: Schema.Types.Number },
                amount: { type: Schema.Types.Number },
                average: { type: Schema.Types.Number },
                max: { type: Schema.Types.Number },
                min: { type: Schema.Types.Number },
                timeUnit: [{ type: Schema.Types.String }],
            },
        ],
        acreageAnalysisData: [
            {
                _id: false,
                transactionType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
                },
                propertyType: { type: Schema.Types.Number, enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id) },
                summary: { type: Schema.Types.Number },
                amount: { type: Schema.Types.Number },
                average: { type: Schema.Types.Number },
                max: { type: Schema.Types.Number },
                min: { type: Schema.Types.Number },
                measureUnit: { type: Schema.Types.String },
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualAnalysisSchema.plugin(autoIncrement.plugin, {
    model: 'visual_analysis',
    startAt: 1,
    incrementBy: 1,
});

VisualAnalysisSchema.index({ referenceDate: 1 }, { name: 'idx_referenceDate', unique: true });

export default mongoose.model<VisualAnalysisDocumentModel>('visual_analysis', VisualAnalysisSchema);
