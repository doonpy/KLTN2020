import mongoose, { Schema } from 'mongoose';

const CatalogSchema: Schema = new Schema(
    {
        title: { type: Schema.Types.String },
        url: { type: Schema.Types.String },
        locator: {
            detailUrl: { type: Schema.Types.String },
            pageNumber: { type: Schema.Types.String },
        },
        hostId: {
            type: Schema.Types.ObjectId,
            ref: 'host',
        },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

export default mongoose.model('catalog', CatalogSchema);
