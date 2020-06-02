import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import autoPopulate from 'mongoose-autopopulate';
import { GroupedDataDocumentModel } from './grouped-data.interface';

autoIncrement.initialize(mongoose.connection);

const GroupedDataSchema: Schema = new Schema(
    {
        items: [
            { type: Schema.Types.Number, ref: 'raw_data', autopopulate: true },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

GroupedDataSchema.plugin(autoIncrement.plugin, {
    model: 'grouped_data',
    startAt: 1,
    incrementBy: 1,
});
GroupedDataSchema.plugin(autoPopulate);

GroupedDataSchema.index({ items: 1 }, { name: 'idx_items' });

const GroupedDataModel = mongoose.model<GroupedDataDocumentModel>(
    'grouped_data',
    GroupedDataSchema
);

export default GroupedDataModel;
