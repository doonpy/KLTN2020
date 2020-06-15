import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import autoPopulate from 'mongoose-autopopulate';
import CommonConstant from '@common/constant';
import { VisualSummaryDistrictDocumentModel } from './interface';

autoIncrement.initialize(mongoose.connection);

const VisualSummaryDistrictSchema: Schema = new Schema(
    {
        districtId: {
            type: Schema.Types.Number,
            ref: 'visual_administrative_district',
            autopopulate: true,
        },
        summaryAmount: { type: Schema.Types.Number },
        summary: [
            {
                _id: false,
                transactionType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
                },
                propertyType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
                },
                amount: { type: Schema.Types.Number },
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualSummaryDistrictSchema.plugin(autoIncrement.plugin, {
    model: 'visual_summary_district',
    startAt: 1,
    incrementBy: 1,
});
VisualSummaryDistrictSchema.plugin(autoPopulate);

VisualSummaryDistrictSchema.index(
    { districtId: 1 },
    { name: 'idx_districtId', unique: true }
);

const Model = mongoose.model<VisualSummaryDistrictDocumentModel>(
    'visual_summary_district',
    VisualSummaryDistrictSchema
);

export default Model;
