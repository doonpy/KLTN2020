import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

autoIncrement.initialize(mongoose.connection);

const hostSchema: Schema = new Schema(
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

export default mongoose.model('host', hostSchema);
