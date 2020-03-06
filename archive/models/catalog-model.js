const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment=require("moment")
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

// format create time
CatalogSchema.virtual("cTimeFormatted").get(function() {
    return moment(this.cTime).format("L LTS");
});

// format update time
CatalogSchema.virtual("mTimeFormatted").get(function() {
    return moment(this.mTime).format("L LTS");
});

module.exports = mongoose.model("catalog", CatalogSchema);
