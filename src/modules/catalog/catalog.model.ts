import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

autoIncrement.initialize(mongoose.connection);

const CatalogSchema: Schema = new Schema(
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
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

CatalogSchema.plugin(autoIncrement.plugin, {
    model: 'catalog',
    startAt: 1,
    incrementBy: 1,
});

export default mongoose.model('catalog', CatalogSchema);
