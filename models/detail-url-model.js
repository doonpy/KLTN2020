const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const detailUrlModel = new Schema(
  {
    url: { type: Schema.Types.String, index: true },
    isExtracted: { type: Schema.Types.Boolean, default: false },
    catalogId: { type: Schema.Types.ObjectId, ref: "catalog", index: true },
    requestRetries: { type: Schema.Types.Number, default: 0, min: 0 }
  },
  { timestamps: { createdAt: "cTime", updatedAt: "eTime" } }
);

module.exports = mongoose.model("detail_url", detailUrlModel);
