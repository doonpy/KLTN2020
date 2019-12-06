const mongoose = require("mongoose");
const Schema = new mongoose.Schema();

const rawCatalog = new Schema({
  title: String,
  paginationNumber: Number,
  isCrawler : Boolean,
});
let rawCatalog = mongoose.model("raw_catalog_history", rawCatalog);
module.exports = rawCatalog;