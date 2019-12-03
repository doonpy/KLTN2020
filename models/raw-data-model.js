const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rawDataSchema = new Schema(
  {
    detailUrlId: {
      type: Schema.Types.ObjectId,
      ref: "detail_url",
      index: true
    },
    title: [String],
    price: [String],
    acreage: [String],
    address: [String],
    others: [
      {
        name: String,
        data: [String],
        _id: false
      }
    ]
  },
  { timestamps: { createdAt: "cTime", updatedAt: "mTime" } }
);

module.exports = mongoose.model("raw_data", rawDataSchema);
