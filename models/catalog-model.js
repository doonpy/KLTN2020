const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CatalogSchema = new Schema(
  {
    header: { type: Schema.Types.String },
    href: { type: Schema.Types.String },
    detailUrl: { type: Schema.Types.String },
    pageNumber: { type: Schema.Types.String },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "host"
    }
  },
  { timestamps: { createdAt: "cTime", updatedAt: "mTime" } }
);

module.exports = mongoose.model("catalog", CatalogSchema);
