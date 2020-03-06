const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const compileDataLogSchema = new Schema(
    {
        groupDataIds: [{type: Schema.Types.ObjectId, ref: "compile_data"}],
        rawDataAmount: {type: Schema.Types.Number, default: 0, min: 0},
        executeTime: {type: Schema.Types.Number, default: 0, min: 0}
    },
    {timestamps: {createdAt: "cTime", updatedAt: "mTime"}}
);

// format create time
compileDataLogSchema.virtual("cTimeFormatted").get(function () {
    return moment(this.cTime).format("L LTS");
});

// format update time
compileDataLogSchema.virtual("mTimeFormatted").get(function () {
    return moment(this.mTime).format("L LTS");
});

module.exports = mongoose.model("compile_log", compileDataLogSchema);
