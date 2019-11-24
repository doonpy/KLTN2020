const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DetailURLSchema = new Schema(
  {
    url: String,
    isExtracted: Boolean,
    catalogId: { type: Schema.Types.ObjectId, ref: " catalog" }
  },
  { timestamps: { createdAt: "cTime", updatedAt: "eTime" } }
);

module.exports = mongoose.model("detail_url", DetailURLSchema);
