const RawModel = require("../models/raw-data-model");

let getAllRawData = async (req, res, next) => {
  let perPage = 500;
 
  let page = req.params.page || 1;
  await RawModel.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function(err, rawdatas) {
      // console.log(rawdatas);

      RawModel.count().exec(function(err, count) {
        if (err) return next(err);
        let assigns = {
          title: "Raw Data",
          breadcrumb: [
            {
              href: "/raw-data",
              pageName: "Raw Data"
            },
          ],
          rawdatas: rawdatas,
          // current: page,
          // pages: Math.ceil(count / perPage)
        };
        res.render("raw-data/datatable", assigns);
      });
    });
};
module.exports = {
  getAllRawData: getAllRawData
};
