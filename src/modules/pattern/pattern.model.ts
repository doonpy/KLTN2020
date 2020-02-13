import mongoose, { Schema } from 'mongoose';

const patternSchema: Schema = new Schema(
    {
        catalogId: { type: Schema.Types.ObjectId, ref: 'catalog' },
        sourceUrl: { type: Schema.Types.ObjectId, ref: 'detail_url' },
        mainLocator: {
            title: { type: Schema.Types.String },
            price: { type: Schema.Types.String },
            acreage: { type: Schema.Types.String },
            address: { type: Schema.Types.String },
        },
        subLocator: [
            {
                name: Schema.Types.String,
                locator: { type: Schema.Types.String },
                _id: false,
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

export default mongoose.model('pattern', patternSchema);
