const CompileLog = require("../models/compile-log-model");
const CompileData = require("../models/compile-data-model");
const async = require("async");

exports.getLastCompile = (req, res, next) => {
  async.waterfall(
      [
        function (callback) {
          CompileLog.find()
              .limit(1)
              .sort({$natural: -1})
              .exec((err, compileLogs) => {
                if (err) {
                  next(err);
                  return;
                }
                callback(null, compileLogs[0]);
              });
        },
        function (compileLog, callback) {
          if (!compileLog) {
            callback(null, [], []);
          } else {
            CompileData.aggregate([
              {
                $match: {
                  _id: {
                    $in: compileLog.groupDataIds
                  }
                }
              },
              {
                $lookup: {
                from: "raw_datas",
                localField: "groupData",
                foreignField: "_id",
                as: "dataGroup"
              }
            },
            {
              $lookup: {
                from: "detail_urls",
                localField: "dataGroup.detailUrlId",
                foreignField: "_id",
                as: "detailUrlGroup"
              }
            },
            {
              $lookup: {
                from: "catalogs",
                localField: "catalogIds",
                foreignField: "_id",
                as: "catalogGroup"
              }
            },
            {
              $lookup: {
                from: "hosts",
                localField: "catalogGroup.hostId",
                foreignField: "_id",
                as: "hostGroup"
              }
            },
            {
              $group: {
                _id: "$catalogIds",
                catalogGroup: {
                  $addToSet: "$catalogGroup"
                },
                hostGroup: {
                  $addToSet: "$hostGroup"
                },
                dataGroup: {
                  $push: {
                    data: "$dataGroup",
                    detailUrl: "$detailUrlGroup"
                  }
                }
              }
            },
            {
              $unwind: {
                path: "$catalogGroup"
              }
            },
            {
              $unwind: {
                path: "$hostGroup"
              }
            }
            ]).exec((err, compileDatas) => {
              if (err) {
                next(err);
                return;
              }
              callback(null, compileDatas, compileLog);
            });
          }
        }
      ],
      (err, compileDatas, compileLog) => {
        if (err) {
          next(err);
          return;
        }
        let assigns = {
          title: "Compile data",
          breadcrumb: [
            {
              href: "/compile-data",
              pageName: "Compile data"
            }
          ],
          compileDatas: compileDatas,
          compileLog: compileLog
        };
        res.render("compile-data/view", assigns);
      }
  );
};
