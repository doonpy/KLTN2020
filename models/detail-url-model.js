const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const detailUrlModel = new Schema({
  hostname: String,
  catalogList: [
    {
      catalogName: String,
      urlList: [{ url: String, isExtracted: Boolean }]
    }
  ]
});

module.exports = mongoose.model("detail_url", detailUrlModel);
