const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const detailUrlModel = new Schema(
    {
        url: Schema.Types.String,
        isExtracted: {type: Schema.Types.Boolean, default: false},
        catalogId: {type: Schema.Types.ObjectId, ref: "catalog"}
    },
    {timestamps: {createdAt: "cTime", updatedAt: "eTime"}}
);

module.exports = mongoose.model("detail_url", detailUrlModel);
