const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const crawlHistorySchema = new Schema({
    hostname: String,
    url: String,
    filename: String,
    lastUpdate: String
});

module.exports = mongoose.model("craw_history", crawlHistorySchema);
