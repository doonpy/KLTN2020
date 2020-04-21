import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { DetailUrlDocumentModel } from './detail-url.interface';

autoIncrement.initialize(mongoose.connection);

const detailUrlSchema: Schema = new Schema(
    {
        catalogId: { type: Schema.Types.Number, ref: 'catalog' },
        url: { type: Schema.Types.String },
        isExtracted: { type: Schema.Types.Boolean, default: false },
        requestRetries: { type: Schema.Types.Number, default: 0 },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

detailUrlSchema.plugin(autoIncrement.plugin, {
    model: 'detail_url',
    startAt: 1,
    incrementBy: 1,
});

detailUrlSchema.index({ url: 1 });

export default mongoose.model<DetailUrlDocumentModel>('detail_url', detailUrlSchema);
