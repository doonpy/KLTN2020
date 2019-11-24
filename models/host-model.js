const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hostSchema = new Schema({
    name: Schema.Types.String
});

module.exports = mongoose.model("host", hostSchema);
