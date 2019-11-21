const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const definitionSchema = new Schema({
  hostname: String,
  definitions: [
    {
        catalogId: String,
      catalogName: String,
      titlexPath: [String],
      pricexPath: [String],
      acreagexPath: [String],
      addressxPath: [String],
      other: [
        {
          name: String,
          xPath: [String],
          _id: false
        }
      ],
      lastUpdate: Number
    }
  ]
});

definitionSchema
  .path("definitions")
  .schema.virtual("lastUpdateFormatted")
  .get(function() {
    return moment(this.lastUpdate).format("L LTS");
  });

/**
 * Get definition by catalog Id
 * @param catalogId
 * @returns {T}
 */
definitionSchema.methods.getDefinitionByCatalogId = function (catalogId) {
    return this.definitions.find(
        definition => definition.catalogId === catalogId
    );
};

module.exports = mongoose.model("definition", definitionSchema);
