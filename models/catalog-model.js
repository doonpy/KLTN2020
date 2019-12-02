const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const CatalogSchema = new Schema({
  name: String,
  hostId: {
    type: ObjectId,
    ref: "host"
  },
});

module.exports = mongoose.model("catalog", CatalogSchema);
