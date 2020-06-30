import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { PatternDocumentModel } from './interface';

const patternSchema: Schema = new Schema(
    {
        sourceUrl: { type: Schema.Types.String, required: true },
        mainLocator: {
            propertyType: { type: Schema.Types.String, required: true },
            title: { type: Schema.Types.String, required: true },
            describe: { type: Schema.Types.String, required: true },
            price: { type: Schema.Types.String, required: true },
            acreage: { type: Schema.Types.String, required: true },
            address: { type: Schema.Types.String, required: true },
            postDate: {
                locator: { type: Schema.Types.String, required: true },
                format: { type: Schema.Types.String, required: true },
                delimiter: {
                    type: Schema.Types.String,
                    enum: ['-', '/', '.'],
                    required: true,
                },
            },
        },
        subLocator: [
            {
                name: Schema.Types.String,
                value: { type: Schema.Types.String },
                _id: false,
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

patternSchema.index({ sourceUrl: 1 }, { name: 'idx_sourceUrl' });

patternSchema.plugin(autoIncrement.plugin, {
    model: 'pattern',
    startAt: 1,
    incrementBy: 1,
});

const Model = mongoose.model<PatternDocumentModel>('pattern', patternSchema);

export default Model;
