const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
      lastUpdate: String
    }
  ]
});

module.exports = mongoose.model("definition", definitionSchema);
