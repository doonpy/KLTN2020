const Definition = require("../models/definition-model");
const mongoose = require("mongoose");
const requestModule = require("../core/module/request");
const fileHelper = require("../helper/file-helper");
const crawlHandle = require("./definition-handler");
const momentTimezone = require("moment-timezone");
const targetHtmlHelper = require("../helper/target-html-handle")

/**
 * get all definition
 */
exports.getIndex = function(req, res, next) {
  Definition.aggregate([
    {
      $lookup: {
        from: "catalogs",
        localField: "catalogId",
        foreignField: "_id",
        as: "catalog"
      }
    },
    { $unwind: "$catalog" },
    {
      $lookup: {
        from: "hosts",
        localField: "catalog.hostId",
        foreignField: "_id",
        as: "host"
      }
    },
    { $unwind: "$host" },
    {
      $group: {
        _id: "$host",
        hostId: { $addToSet: "$host._id" },
        hostname: { $addToSet: "$host.name" },
        catalogs: {
          $addToSet: {
            catalogId: "$catalog._id",
            catalogName: "$catalog.header",
            definitionId: "$_id",
            title: "$title",
            price: "$price",
            acreage: "$acreage",
            address: "$address",
            others: "$others",
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
    },
    { $project: { _id: 0 } },
    { $unwind: "$hostname" },
    { $unwind: "$hostId" }
  ]).exec((err, data) => {
    if (err) {
      next(err);
      return;
    } else {
      let assigns = {
        title: "Definition",
        breadcrumb: [
          {
            href: "/definition",
            pageName: "Definition"
          }
        ],
        data: data
      };
      res.render("definition/view", assigns);
    }
  });
};

/**
 * add definition - get
 * @param req
 * @param res
 * @param next
 */
exports.getAdd = function(req, res, next) {
  let url = req.query.url;
  let catalogId = req.query.catalogId;
  let enableScript = parseInt(req.query.enableScript);
  let definitionId = req.query.definitionId;
  if (!catalogId || catalogId === "") {
    next(new Error("Catalog ID is invalid!"));
  } else {
    let assigns = {
      title: definitionId ? "Update Definition" : "Add Definition",
      breadcrumb: [
        {
          href: "/definition",
          pageName: "Definition"
        },
        {
          href: "/definition/add",
          pageName: "Add"
        }
      ],
      url: url,
      catalogId: catalogId,
      enableScript: enableScript
    };

    if (definitionId) {
      assigns = {
        title: definitionId ? "Update Definition" : "Add Definition",
        breadcrumb: [
          {
            href: "/definition",
            pageName: "Definition"
          },
          {
            href: `/definition/detail/${definitionId}`,
            pageName: "Detail"
          },
          {
            href: "/definition/update",
            pageName: "Update"
          }
        ],
        url: url,
        definitionId: definitionId,
        catalogId: catalogId,
        enableScript: enableScript
      };
    }

    if (url) {
      requestModule
        .send(url)
        .then(response => {
          const folderPath = `${process.env.STORAGE_PATH}/${response.request.uri.host}`;
          const bodyHtml = targetHtmlHelper.handleLinkFile(response, enableScript);

          fileHelper
              .createFile(folderPath, `${url}.html`, bodyHtml, true)
              .then(fileName => {
                assigns.fileName = fileName;
                assigns.hostname = response.request.uri.host;
                res.render("definition/add", assigns);
              })
              .catch(err => {
                next(err);
            });
        })
        .catch(err => {
          assigns.error = err;
          res.render("definition/add", assigns);
        });
    } else {
      next(new Error("URL null!"));
    }
  }
};

/**
 * post add definition
 * @param req
 * @param res
 * @param next
 */
exports.postAdd = (req, res, next) => {
  let catalogId = req.body.catalogId.trim();
  let targetUrl = req.body.targetUrl.trim();
  let hostName = req.body.hostName.trim();
  let fileName = req.body.fileName.trim();
  let data = JSON.parse(req.body.data);

  if (!catalogId || catalogId === "") {
    res.json({
      message: "Catalog ID is invalid!",
      status: false
    });
  } else {
    crawlHandle
      .saveDefinition(catalogId, targetUrl, data)
      .then(definitionId => {
        const folderPath = `${process.env.STORAGE_PATH}/${hostName}`;
        fileHelper.deleteFile(folderPath, fileName);
        res.json({
          message: "Add definition success!",
          redirectUrl: `/definition/detail/${definitionId}`,
          status: true
        });
      })
      .catch(err => {
        res.json({
          message: err.err.message,
          redirectUrl: err.redirectUrl,
          status: false
        });
      });
  }
};

/**
 * get detail of definition
 * @param req
 * @param res
 * @param next
 */
exports.getDetail = (req, res, next) => {
  let definitionId = req.params.id;
  let assigns = {
    title: "Detail Definition",
    breadcrumb: [
      {
        href: "/definition",
        pageName: "Definition"
      },
      {
        href: `/definition/detail/${definitionId}`,
        pageName: "Detail"
      }
    ]
  };
  Definition.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(definitionId)
      }
    },
    {
      $lookup: {
        from: "detail_urls",
        localField: "catalogId",
        foreignField: "catalogId",
        as: "detailUrls"
      }
    },
    {
      $lookup: {
        from: "catalogs",
        localField: "catalogId",
        foreignField: "_id",
        as: "catalog"
      }
    },
    {
      $unwind: {
        path: "$catalog"
      }
    },
    {
      $lookup: {
        from: "hosts",
        localField: "catalog.hostId",
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
      $lookup: {
        from: "detail_urls",
        localField: "targetUrl",
        foreignField: "_id",
        as: "targetUrl"
      }
    },
    {
      $unwind: {
        path: "$targetUrl"
      }
    },
    {
      $project: {
        title: 1,
        price: 1,
        acreage: 1,
        address: 1,
        targetUrl: 1,
        others: 1,
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
        },
        catalog: 1,
        host: 1,
        detailUrls: 1
      }
    }
  ]).exec((err, definition) => {
    if (err) {
      next(err);
      return;
    }
    if (!definition[0]) {
      next(new Error("Definition not found!"));
      return;
    } else {
      assigns.definition = definition[0];
      assigns.host = definition[0].host;
      assigns.catalog = definition[0].catalog;
      assigns.urlForDefinition = definition[0].detailUrls;
      res.render("definition/detail", assigns);
    }
  });
};

/**
 * get delete definition
 * @param req
 * @param res
 * @param next
 */
exports.getDelete = (req, res, next) => {
  const definitionId = req.params.definitionId;
  let assigns = {
    title: "Delete Definition",
    breadcrumb: [
      {
        href: "/definition",
        pageName: "Definition"
      },
      {
        href: `/definition/detail/${definitionId}`,
        pageName: "Detail"
      },
      {
        href: "/definition/delete",
        pageName: "Delete"
      }
    ]
  };
  Definition.findOne({ _id: definitionId }, (err, definition) => {
    if (err) {
      next(err);
      return;
    }
    if (!definition) {
      next(new Error("Definition not found!"));
      return;
    }
    assigns.definition = definition;
    res.render("definition/delete", assigns);
  }).populate("catalogId");
};

/**
 * handle POST delete
 * @param req
 * @param res
 * @param next
 */
exports.postDelete = (req, res, next) => {
  const definitionId = req.body.definitionId;
  Definition.findOne({_id: definitionId}, (err, definition) => {
    if (err) {
      next(err);
      return;
    }
    if (!definition) {
      next(new Error("Definition not found!"));
      return;
    }
    Definition.deleteOne({_id: definitionId}, err => {
      if (err) {
        next(err);
        return;
      }
      res.redirect("/definition");
    });
  });
};
