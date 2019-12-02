const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const definitionSchema = new Schema(
  {
    catalogId: { type: Schema.Types.ObjectId, ref: "catalog" },
    targetUrl: { type: Schema.Types.ObjectId, ref: "detail_url" },
    title: [Schema.Types.String],
    price: [Schema.Types.String],
    acreage: [Schema.Types.String],
    address: [Schema.Types.String],
    others: [
      {
        name: Schema.Types.String,
        xpath: [Schema.Types.String],
        _id: false
      }
    ]
  },
  { timestamps: { createdAt: "cTime", updatedAt: "mTime" } }
);

// format create time
definitionSchema.virtual("cTimeFormatted").get(function() {
  return moment(this.cTime).format("L LTS");
});

// format update time
definitionSchema.virtual("mTimeFormatted").get(function() {
  return moment(this.mTime).format("L LTS");
});

/**
 * Get definition by catalog Id
 * @param catalogId
 * @returns {T}
 */
definitionSchema.methods.getDefinitionByCatalogId = function(catalogId) {
  return this.definitions.find(
    definition => definition.catalogId === catalogId
  );
};

module.exports = mongoose.model("definition", definitionSchema);
