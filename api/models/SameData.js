const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let SameDataSchema = new Schema({
    name: String,
    level: Number,
    attr: Object,
    text: String
})
SameDataSchema.statics = {
    createNew(item) {
        //this : ContactSchema = Schemamongoose
        // create: function of Schema
        return this.create(item)
    },
    getAllSame() {
        return this.find({}).exec();
    }
}
module.exports = mongoose.model("samedata", SameDataSchema)