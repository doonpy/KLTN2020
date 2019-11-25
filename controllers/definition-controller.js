const Definition = require("../models/definition-model");
const requestModule = require("../core/module/request");
const fileHelper = require("../helper/file-helper");
const crawlHandle = require("./definition-handler");
const momentTimezone = require("moment-timezone");

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
        {$unwind: "$catalog"},
        {
            $lookup: {
                from: "hosts",
                localField: "catalog.hostId",
                foreignField: "_id",
                as: "host"
            }
        },
        {$unwind: "$host"},
        {
            $group: {
                _id: "$host",
                hostId: {$addToSet: "$host._id"},
                hostname: {$addToSet: "$host.name"},
                catalogs: {
                    $addToSet: {
                        catalogId: "$catalog._id",
                        catalogName: "$catalog.name",
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
        {$project: {_id: 0}},
        {$unwind: "$hostname"},
        {$unwind: "$hostId"}
    ]).exec((err, data) => {
        if (err) {
            next(err);
            return;
        } else {
            // res.send(data);
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
    if (!catalogId || catalogId === "") {
        next(new Error("Catalog ID is invalid!"));
    } else {
        let assigns = {
            title: "Add Definition",
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
            catalogId: catalogId
        };
        if (url) {
            requestModule
                .send(url)
                .then(response => {
                    const folderPath = `${process.env.STORAGE_PATH}/${response.request.uri.host}`;
                    fileHelper
                        .createFile(folderPath, `${url}.html`, response.body, true)
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
            res.send("URL NULL");
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
    let data = JSON.parse(req.body.data);

    if (!catalogId || catalogId === "") {
        res.json({
            message: "Catalog ID is invalid!",
            status: false
        });
    } else {
        crawlHandle
            .saveDefinition(catalogId, data)
            .then(() => {
                res.json({
                    message: "Add definition success!",
                    status: true
                });
            })
            .catch(err => {
                res.json({
                    message: err.message,
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
        href: "/definition/detail",
        pageName: "Detail"
      }
    ]
  };
    Definition.findById(definitionId)
        .populate({path: "catalogId", populate: {path: "hostId"}})
        .exec((err, definition) => {
            if (err) {
                next(err);
                return;
            }
      if (!definition) {
          next(new Error("Definition not found!"));
        return;
      } else {
          assigns.definition = definition;
          assigns.hostname = definition.catalogId.hostId.name;
          assigns.catalogName = definition.catalogId.name;
          res.render("definition/detail", assigns);
      }
        });
};
