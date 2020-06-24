import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import autoPopulate from 'mongoose-autopopulate';
import { DetailUrlDocumentModel } from './interface';

autoIncrement.initialize(mongoose.connection);

const detailUrlSchema: Schema = new Schema(
    {
        catalogId: {
            type: Schema.Types.Number,
            ref: 'catalog',
            autopopulate: true,
            required: true,
        },
        url: { type: Schema.Types.String, required: true },
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
detailUrlSchema.plugin(autoPopulate);

detailUrlSchema.index({ url: 1 }, { name: 'idx_url' });
detailUrlSchema.index({ isExtracted: 1 }, { name: 'idx_isExtracted' });
detailUrlSchema.index({ requestRetries: 1 }, { name: 'idx_requestRetries' });
detailUrlSchema.index(
    { catalogId: 1, isExtracted: 1, requestRetries: 1 },
    { name: 'idx_catalogId_isExtracted_requestRetries' }
);

const Model = mongoose.model<DetailUrlDocumentModel>(
    'detail_url',
    detailUrlSchema
);

export default Model;
