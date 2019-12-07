const RawModel = require("../models/raw-data-model");

let getAllRawData = async (req, res, next) => {
  let perPage = 500;
 
  let page = req.params.page || 1;
  await RawModel.find({})
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec(function (err, rawDatas) {
          RawModel.count().exec(function (err, count) {
              if (err) return next(err);
              let assigns = {
                  title: "Raw data",
                  breadcrumb: [
                      {
                          href: "/raw-data",
                          pageName: "Raw data"
                      },
                  ],
                  rawDatas: rawDatas,
              };
              res.render("raw-data/view", assigns);
          });
      });
};
module.exports = {
  getAllRawData: getAllRawData
};
