import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

const detailUrlSchema: Schema = new Schema(
    {
        catalogId: { type: Schema.Types.Number, ref: 'catalog' },
        url: { type: Schema.Types.String },
        isExtracted: { type: Schema.Types.Boolean, default: false },
        requestRetries: { type: Schema.Types.Number, default: 0, min: 0 },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

detailUrlSchema.plugin(autoIncrement.plugin, {
    model: 'detail_url',
    startAt: 1,
    incrementBy: 1,
});

export default mongoose.model('detail_url', detailUrlSchema);
