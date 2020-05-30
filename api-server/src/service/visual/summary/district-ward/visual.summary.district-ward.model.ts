import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import CommonConstant from '@common/common.constant';
import { VisualSummaryDistrictWardDocumentModel } from './visual.summary.district-ward.interface';

autoIncrement.initialize(mongoose.connection);

const VisualSummaryDistrictWardSchema: Schema = new Schema(
    {
        districtId: { type: Schema.Types.Number, ref: 'visual_administrative_district' },
        wardId: { type: Schema.Types.Number, ref: 'visual_administrative_ward' },
        summaryAmount: { type: Schema.Types.Number },
        summary: [
            {
                _id: false,
                transactionType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.TRANSACTION_TYPE.map((item) => item.id),
                },
                propertyType: { type: Schema.Types.Number, enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id) },
                amount: { type: Schema.Types.Number },
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualSummaryDistrictWardSchema.plugin(autoIncrement.plugin, {
    model: 'visual_summary_district_ward',
    startAt: 1,
    incrementBy: 1,
});

VisualSummaryDistrictWardSchema.index({ districtId: 1, wardId: 1 }, { name: 'idx_districtId_wardId', unique: true });

export default mongoose.model<VisualSummaryDistrictWardDocumentModel>(
    'visual_summary_district_ward',
    VisualSummaryDistrictWardSchema
);
