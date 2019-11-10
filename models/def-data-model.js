const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dataDefSchema = new Schema({
    host: String,
    definitions: {
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
        _id: false
    },
    lastUpdate: String
});

module.exports = mongoose.model("data_def", dataDefSchema);
