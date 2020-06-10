import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { HostDocumentModel } from './interface';

autoIncrement.initialize(mongoose.connection);

const hostSchema = new Schema<HostDocumentModel>(
    {
        name: Schema.Types.String,
        domain: Schema.Types.String,
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

hostSchema.plugin(autoIncrement.plugin, {
    model: 'host',
    startAt: 1,
    incrementBy: 1,
});

hostSchema.index({ domain: 1 }, { name: 'idx_domain' });
hostSchema.index({ name: 1 }, { name: 'idx_name' });

const Model = mongoose.model<HostDocumentModel>('host', hostSchema);

export default Model;
