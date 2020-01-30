const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const extractLogSchema = new Schema(
  {
    urls: [
      {
        _id: false,
        id: { type: Schema.Types.ObjectId, ref: "detail_url" },
        isSuccess: Schema.Types.Boolean,
        errorMsg: { type: Schema.Types.String, default: "" }
      }
    ],
    requestAmount: { type: Schema.Types.Number, default: 0, min: 0 },
    successAmount: { type: Schema.Types.Number, default: 0, min: 0 },
    failedAmount: { type: Schema.Types.Number, default: 0, min: 0 },
    executeTime: { type: Schema.Types.Number, default: 0, min: 0 }
  },
  { timestamps: { createdAt: "cTime", updatedAt: "mTime" } }
);

module.exports = mongoose.model("extract_log", extractLogSchema);
