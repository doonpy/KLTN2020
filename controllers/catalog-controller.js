const Catalog = require("../models/catalog-model");
const DetailUrl = require("../models/detail-url-model");
const Host = require("../models/host-model");
const async = require("async");
const mongoose = require("mongoose");
const targetHtmlHelper = require("../helper/target-html-handle");
const requestModule = require("../core/module/request");
const fileHelper = require("../helper/file-helper");
const moment=require("moment");

const DETAIL_URL_LIMIT = 1001;

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
            header: "$header",
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
        hostDomain: "$host.domain",
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
            $match: { _id: mongoose.Types.ObjectId(catalogId) }
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
            $lookup: {
              from: "definitions",
              localField: "_id",
              foreignField: "catalogId",
              as: "definition"
            }
          },
          {
            $unwind: {
              path: "$host"
            }
          }
        ]).exec(callback);
      },
      detailUrls: function(callback) {
        DetailUrl.find({ catalogId: catalogId })
          .limit(DETAIL_URL_LIMIT)
          .sort({ $natural: -1 })
          .exec(callback);
      }
    },
    (err, data) => {
      if (err) {
        next(err);
        return;
      }
      let { catalog, detailUrls } = data;
      let detailUrlAmount =
        detailUrls.length === DETAIL_URL_LIMIT
          ? `${DETAIL_URL_LIMIT - 1}+`
          : detailUrls.length.toString();
      if (catalog.length === 0) {
        next(new Error("Catalog not found!"));
      } else {
        catalog[0].cTime = moment(catalog[0].cTime).format("L LTS")
        catalog[0].mTime=moment(catalog[0].mTime).format("L LTS")
        assigns.data = catalog[0];
        assigns.urlForDefinition = detailUrls;
        assigns.detailUrlAmount = detailUrlAmount;

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

/**
 * Ajax post add catalog
 * @param req
 * @param res
 * @param next
 */
exports.ajaxPostAdd = (req, res, next) => {
  let data = req.body;
  let { hostname, domain, catalogData } = data;
  if (!targetHtmlHelper.isValidTarget(domain)) {
    res.json({
      status: false,
      message: "Domain is invalid!"
    });
    return;
  }

  Host.findOne({ domain: domain }, (err, hostFound) => {
    if (err) {
      res.json({
        status: false,
        message: err.message
      });
      return;
    }
    catalogData = JSON.parse(catalogData);
    if (hostFound) {
      hostFound.name = hostname;
      hostFound.save();
      let isError = false;
      for (let i = 0; i < catalogData.length; i++) {
        catalogData[i].hostId = hostFound._id;
        Catalog.findOneAndUpdate(
          { hostId: catalogData[i].hostId, header: catalogData[i].header },
          catalogData[i],
          { upsert: true }
        ).exec(err => {
          if (err) {
            res.json({
              status: false,
              message: err.message
            });
            isError = true;
          }
        });
        if (isError) {
          break;
        }
      }
      if (!isError) {
        res.json({
          status: true,
          message: "Save catalog success!"
        });
      }
    } else {
      new Host({ name: hostname, domain: domain }).save((err, doc) => {
        if (err) {
          res.json({
            status: false,
            message: err.message
          });
          return;
        }
        catalogData.forEach(cd => {
          cd.hostId = doc._id;
        });
        Catalog.insertMany(catalogData, err => {
          if (err) {
            res.json({
              status: false,
              message: err.message
            });
            return;
          }
          res.json({
            status: true,
            message: "Save catalog success!"
          });
        });
      });
    }
  });
};
