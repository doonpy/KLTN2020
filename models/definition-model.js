const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const definitionSchema = new Schema({
  hostname: String,
  definitions: [
    {
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
    console.log(this.lastUpdate);
    return moment(this.lastUpdate).format("L LTS");
  });

module.exports = mongoose.model("definition", definitionSchema);
