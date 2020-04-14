import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import GroupedDataModelInterface from './grouped-data.model.interface';

autoIncrement.initialize(mongoose.connection);

const GroupedDataSchema: Schema = new Schema(
    {
        items: [{ type: Schema.Types.Number, ref: 'raw_data' }],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

GroupedDataSchema.plugin(autoIncrement.plugin, {
    model: 'grouped_data',
    startAt: 1,
    incrementBy: 1,
});

export default mongoose.model<GroupedDataModelInterface>('grouped_data', GroupedDataSchema);
