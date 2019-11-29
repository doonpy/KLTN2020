const DetailUrl = require("../models/detail-url-model");
const Catalog = require("../models/catalog-model");
const Definition = require("../models/definition-model");
const async = require("async");
const momentTimezone = require("moment-timezone");

exports.getIndex = (req, res, next) => {
  async.parallel(
    {
      catalogByHost: function(callback) {
        Catalog.aggregate([
          {
            $group: {
              _id: "$hostId",
              catalogs: {
                $push: {
                  catalogId: "$_id",
                  catalogName: "$name"
                }
              }
            }
          },
          {
            $lookup: {
              from: "hosts",
              localField: "_id",
              foreignField: "_id",
              as: "host"
            }
          },
          { $unwind: "$host" },
          {
            $project: {
              hostId: "$host._id",
              hostName: "$host.name",
              _id: 0,
              catalogs: 1
            }
          }
        ]).exec(callback);
      },
      detailUrls: function(callback) {
        DetailUrl.aggregate([
          { $match: { isExtracted: false } },
          {
            $group: {
              _id: "$catalogId",
              detailUrls: {
                $push: {
                  id: "$_id",
                  url: "$url",
                  isExtracted: "$isExtracted",
                  cTime: {
                    $dateToString: {
                      format: "%Y-%m-%d %H:%M:%S",
                      date: "$cTime",
                      timezone: momentTimezone.tz.guess()
                    }
                  },
                  mTime: {
                    $dateToString: {
                      format: "%Y-%m-%d %H:%M:%S",
                      date: "$mTime",
                      timezone: momentTimezone.tz.guess()
                    }
                  }
                }
              }
            }
          }
        ]).exec(callback);
      },
      definitions: function(callback) {
        Definition.find({}, "catalogId").exec(callback);
      }
    },
    (err, data) => {
      if (err) {
        next(err);
      } else {
        data.catalogByHost.forEach(host => {
          host.catalogs.map(catalog => {
            let catalogFound = data.detailUrls.find(
              d => d._id.toString() === catalog.catalogId.toString()
            );
            let definitionFound = data.definitions.find(
              d => d.catalogId.toString() === catalog.catalogId.toString()
            );
            catalog["isDefined"] = definitionFound ? true : false;
            catalog["urls"] = catalogFound ? catalogFound.detailUrls : [];
            return catalog;
          });
        });
        let assigns = {
          title: "Extract",
          breadcrumb: [
            {
              href: "/extract",
              pageName: "Extract"
            }
          ],
          data: data.catalogByHost
        };
        res.render("extract/view", assigns);
        // res.json(data.catalogByHost);
      }
    }
  );
};
