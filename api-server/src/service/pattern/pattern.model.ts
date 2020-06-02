import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { PatternDocumentModel } from './pattern.interface';

const patternSchema: Schema = new Schema(
    {
        sourceUrl: { type: Schema.Types.String },
        mainLocator: {
            propertyType: { type: Schema.Types.String },
            title: { type: Schema.Types.String },
            describe: { type: Schema.Types.String },
            price: { type: Schema.Types.String },
            acreage: { type: Schema.Types.String },
            address: { type: Schema.Types.String },
            postDate: {
                locator: { type: Schema.Types.String },
                format: { type: Schema.Types.String },
                delimiter: { type: Schema.Types.String, enum: ['-', '/', '.'] },
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

const PatternModel = mongoose.model<PatternDocumentModel>('pattern', patternSchema);

export default PatternModel;
