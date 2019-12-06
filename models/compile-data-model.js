const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const compileDataSchema = new Schema(
    {
        catalogIds: [{type: Schema.Types.ObjectId, ref: "catalog"}],
        groupData: [{type: Schema.Types.ObjectId, ref: "raw_data"}],
    },
    {timestamps: {createdAt: "cTime", updatedAt: "mTime"}}
);

module.exports = mongoose.model("compile_data", compileDataSchema);
