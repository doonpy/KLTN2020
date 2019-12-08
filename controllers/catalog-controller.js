const Catalog = require("../models/catalog-model");
const DetailUrl = require("../models/detail-url-model");
const async = require("async");
const mongoose = require("mongoose");
const targetHtmlHelper = require("../helper/target-html-handle");
const requestModule = require("../core/module/request");
const fileHelper = require("../helper/file-helper");

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
        href: `/catalog/detail/${catalogId}`,
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
      detailUrls: function(callback) {
        DetailUrl.find({ catalogId: catalogId, isExtracted: false }).exec(
          callback
        );
      }
    },
    (err, data) => {
      let { catalog, detailUrls } = data;
      if (err) {
        next(err);
        return;
      }
      if (catalog.length === 0) {
        next(new Error("Catalog not found!"));
        return;
      } else {
        assigns.data = catalog[0];
        assigns.urlForDefinition = detailUrls;

        res.render("catalog/detail", assigns);
      }
    }
  );
};

/**
 * get add controller
 * @param req
 * @param res
 * @param next
 */
exports.getAdd = (req, res, next) => {
  let target = req.query.target.trim();
  let enableScript = parseInt(req.query.enableScript);
  if (!targetHtmlHelper.isValidTarget(target)) {
    let assigns = {
      title: "Home",
      breadcrumb: [
        {
          href: "/",
          pageName: "Home"
        }
      ],
      error: `${target} - domain or protocol is invalid!`
    };
    res.render("index/view", assigns);
  } else {
    let assigns = {
      title: "Add catalog",
      breadcrumb: [
        {
          href: "/catalog",
          pageName: "Catalog"
        },
        {
          href: `/catalog/add?target=${target}`,
          pageName: "Add"
        }
      ],
      target: target,
      enableScript: enableScript
    };

    requestModule
        .send(target)
        .then(response => {
          const folderPath = `${process.env.STORAGE_PATH}/${response.request.uri.host}`;
          const bodyHtml = targetHtmlHelper.handleLinkFile(
              response,
              enableScript
          );
          fileHelper
              .createFile(folderPath, `${target}.html`, bodyHtml, true)
              .then(fileName => {
                assigns.fileName = fileName;
                assigns.hostname = response.request.uri.host;
                res.render("catalog/add", assigns);
              })
              .catch(err => {
                next(err);
              });
        })
        .catch(err => {
          assigns.error = err;
          res.render("index/view", assigns);
        });
  }
};
