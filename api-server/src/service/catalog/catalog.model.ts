import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import autoPopulate from 'mongoose-autopopulate';
import { CatalogDocumentModel } from './catalog.interface';

autoIncrement.initialize(mongoose.connection);

const catalogSchema = new Schema(
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
            autopopulate: true,
        },
        patternId: {
            type: Schema.Types.Number,
            ref: 'pattern',
            autopopulate: true,
        },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

catalogSchema.plugin(autoIncrement.plugin, {
    model: 'catalog',
    startAt: 1,
    incrementBy: 1,
});
catalogSchema.plugin(autoPopulate);

catalogSchema.index({ title: 1 }, { name: 'idx_title' });
catalogSchema.index({ url: 1 }, { name: 'idx_url' });
catalogSchema.index({ patternId: 1 }, { name: 'idx_patternId' });
catalogSchema.index(
    { hostId: 1, patternId: 1, url: 1, title: 1 },
    { name: 'idx_hostId_patternId_url_title' }
);

const CatalogModel = mongoose.model<CatalogDocumentModel>(
    'catalog',
    catalogSchema
);

export default CatalogModel;
