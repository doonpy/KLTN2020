const Catalog = require("../models/catalog-model");
const DetailUrl = require("../models/detail-url-model");
const async = require("async");
const mongoose = require("mongoose");

/**
 * get index controller
 * @param req
 * @param res
 * @param next
 */
exports.getIndex = (req, res, next) => {
  Catalog.aggregate([
    {
      $lookup: {
        from: "definitions",
        localField: "_id",
        foreignField: "catalogId",
        as: "definition"
      }
    },
    {
      $group: {
        _id: "$hostId",
        catalogs: {
          $push: {
            id: "$_id",
            name: "$name",
            isDefined: {
              $cond: {
                if: {
                  $eq: [
                    {
                      $size: "$definition"
                    },
                    0
                  ]
                },
                then: false,
                else: true
              }
            }
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
    {
      $unwind: {
        path: "$host"
      }
    },
    {
      $project: {
        hostName: "$host.name",
        catalogs: 1
      }
    }
  ]).exec((err, data) => {
    if (err) {
      next(err);
      return;
    }
    let assigns = {
      title: "Catalog",
      breadcrumb: [
        {
          href: "/catalog",
          pageName: "Catalog"
        }
      ],
      data: data
    };
    res.render("catalog/view", assigns);
  });
};

/**
 * get detail controller
 * @param req
 * @param res
 * @param next
 */
exports.getDetail = (req, res, next) => {
  let catalogId = req.params.catalogId;
  let assigns = {
    title: "Detail catalog",
    breadcrumb: [
      {
        href: "/catalog",
        pageName: "Catalog"
      },
      {
        href: "/catalog/detail",
        pageName: "Detail"
      }
    ]
  };
  async.parallel(
    {
      catalog: function(callback) {
        Catalog.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(catalogId)
            }
          },
          {
            $lookup: {
              from: "detail_urls",
              localField: "_id",
              foreignField: "catalogId",
              as: "detailUrls"
            }
          },
          {
            $lookup: {
              from: "definitions",
              localField: "_id",
              foreignField: "catalogId",
              as: "definition"
            }
          },
          {
            $lookup: {
              from: "hosts",
              localField: "hostId",
              foreignField: "_id",
              as: "host"
            }
          },
          {
            $project: {
              detailUrls: {
                $size: "$detailUrls"
              },
              definition: {
                $cond: {
                  if: {
                    $eq: [
                      {
                        $size: "$definition"
                      },
                      0
                    ]
                  },
                  then: false,
                  else: {
                    $arrayElemAt: ["$definition", 0]
                  }
                }
              },
              host: {
                $cond: {
                  if: {
                    $eq: [
                      {
                        $size: "$host"
                      },
                      0
                    ]
                  },
                  then: false,
                  else: {
                    $arrayElemAt: ["$host", 0]
                  }
                }
              },
              name: 1
            }
          },
          {
            $project: {
              definitionId: {
                $cond: {
                  if: {
                    $eq: ["$definition", false]
                  },
                  then: false,
                  else: "$definition._id"
                }
              },
              hostName: "$host.name",
              name: 1,
              detailUrls: 1
            }
          }
        ]).exec(callback);
      },
      detailUrl: function(callback) {
        DetailUrl.findOne({ catalogId: catalogId, isExtracted: false }).exec(
          callback
        );
      }
    },
    (err, data) => {
      let { catalog, detailUrl } = data;
      if (err) {
        next(err);
        return;
      }
      if (catalog.length === 0) {
        next(new Error("Catalog not found!"));
        return;
      } else {
        assigns.data = catalog[0];
        if (!catalog.definitionId) {
          assigns.urlForDefinition = detailUrl ? detailUrl.url :
              undefined;
        }
        res.render("catalog/detail", assigns);
      }
    }
  );
};
