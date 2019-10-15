const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const targetSchema = new Schema({
  url: {type: String},
  lastCrawl: {type: Date},
});

targetSchema.virtual('lastCrawl_formatted').get(function() {
  return moment(this.lastCrawl).format('L LTS');
});

module.exports = mongoose.model('Target', targetSchema);
