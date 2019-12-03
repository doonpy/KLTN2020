const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const ObjectId = Schema.Types.ObjectId;
const HostnameSchema = new Schema({
  name: String,
});

module.exports = mongoose.model("host", HostnameSchema);
