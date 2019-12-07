const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rawDataSchema = new Schema(
  {
    detailUrlId: {
      type: Schema.Types.ObjectId,
      ref: "detail_url"
    },
    title: [{ type: Schema.Types.String, default: "" }],
    price: [{ type: Schema.Types.String, default: "" }],
    acreage: [{ type: Schema.Types.String, default: "" }],
    address: [{ type: Schema.Types.String, default: "" }],
    others: [
      {
        name: { type: Schema.Types.String, default: "" },
        data: [{ type: Schema.Types.String, default: "" }],
        _id: false
      }
    ]
  },
  { timestamps: { createdAt: "cTime", updatedAt: "mTime" } }
);

module.exports = mongoose.model("raw_data", rawDataSchema);
