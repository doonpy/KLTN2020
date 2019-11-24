const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const catalogSchema = new Schema({
    name: Schema.Types.String,
    hostId: {type: Schema.Types.ObjectId, ref: "host"}
});

module.exports = mongoose.model("catalog", catalogSchema);
