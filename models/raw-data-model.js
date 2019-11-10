const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rawDataSchema = new Schema({
    url: String,
    title: [String],
    price: [String],
    acreage: [String],
    address: [String],
    other: [
        {
            name: String,
            data: [String],
            _id: false
        }
    ]
});

module.exports = mongoose.model("raw_data", rawDataSchema);
