const RawModel = require("../models/raw-data-model");

let getAllRawData = async(req, res, next) => {
  let perPage = 100;
  let page = req.params.page || 1;
  await RawModel.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function(err, rawdatas) {
      // console.log(rawdatas);

      RawModel.count().exec(function(err, count) {
        if (err) return next(err);
        res.render("raw-data", {
          rawdatas: rawdatas,
          current: page,
          pages: Math.ceil(count / perPage)
        });
      });
    });
};
//https://evdokimovm.github.io/javascript/nodejs/mongodb/pagination/expressjs/ejs/bootstrap/2017/08/20/create-pagination-with-nodejs-mongodb-express-and-ejs-step-by-step-from-scratch.html
//https://medium.com/@pprachit09/pagination-using-mongoose-express-and-pug-7033cb487ce7

module.exports = {
  getAllRawData: getAllRawData
};
