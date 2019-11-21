const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const detailUrlModel = new Schema({
  hostname: String,
  catalogList: [
    {
      catalogName: String,
      urlList: [{url: String, isExtracted: Boolean, _id: false}]
    }
  ]
});

detailUrlModel.methods.getCatalogListById = function (catalogId) {
  return this.catalogList.find(catalog => catalog._id == catalogId);
};

module.exports = mongoose.model("detail_url", detailUrlModel);
