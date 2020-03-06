const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const crawlDetailLogSchema = new Schema(
  {
    catalogId: { type: Schema.Types.ObjectId, ref: "catalog" },
    waiting: [
      {
        url: { type: Schema.Types.String },
        retries: { type: Schema.Types.Number, default: 0 },
        _id: false
      }
    ],
    success: [
      {
        url: { type: Schema.Types.String },
        retries: { type: Schema.Types.Number, default: 0 },
        _id: false
      }
    ],
    failed: [
      {
        url: { type: Schema.Types.String },
        retries: { type: Schema.Types.Number, default: 0 },
        _id: false
      }
    ],
    executeTime: { type: Schema.Types.Number },
    urlAmount: { type: Schema.Types.Number }
  },
  { timestamps: { createdAt: "cTime", updatedAt: "mTime" } }
);

module.exports = mongoose.model("crawl_detail_log", crawlDetailLogSchema);
