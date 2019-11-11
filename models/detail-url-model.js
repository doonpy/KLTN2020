const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const detailUrlModel = new Schema({
    domain: String,
    catalogList: [
        {
            catalogName: String,
            xPath: String,
            urlList: [{url: String, isExtracted: Boolean}]
        }
    ]
});

module.exports = mongoose.model("detail_url", detailUrlModel);
