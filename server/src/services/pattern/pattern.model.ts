import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import PatternModelInterface from './pattern.model.interface';

const patternSchema: Schema = new Schema(
    {
        sourceUrl: { type: Schema.Types.String },
        mainLocator: {
            propertyType: { type: Schema.Types.String },
            title: { type: Schema.Types.String },
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
                locator: { type: Schema.Types.String },
                _id: false,
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

patternSchema.plugin(autoIncrement.plugin, {
    model: 'pattern',
    startAt: 1,
    incrementBy: 1,
});

export default mongoose.model<PatternModelInterface>('pattern', patternSchema);
