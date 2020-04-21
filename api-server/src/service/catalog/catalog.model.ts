import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { CatalogDocumentModel } from './catalog.interface';

autoIncrement.initialize(mongoose.connection);

const catalogSchema: Schema = new Schema(
    {
        title: { type: Schema.Types.String },
        url: { type: Schema.Types.String },
        locator: {
            detailUrl: { type: Schema.Types.String },
            pageNumber: { type: Schema.Types.String },
        },
        hostId: {
            type: Schema.Types.Number,
            ref: 'host',
        },
        patternId: {
            type: Schema.Types.Number,
            ref: 'pattern',
        },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

catalogSchema.plugin(autoIncrement.plugin, {
    model: 'catalog',
    startAt: 1,
    incrementBy: 1,
});

catalogSchema.index({ url: 1 });

export default mongoose.model<CatalogDocumentModel>('catalog', catalogSchema);
