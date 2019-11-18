const Definition = require("../models/definition-model");
const requestCore = require("../core/request");
const fileHelper = require("../helper/file-helper");

/**
 * get all definition
 */
exports.getIndex = function(req, res, next) {
  Definition.find({}, (err, definitions) => {
    if (err) next(err);
    let assigns = {
      title: "Definition",
      breadcrumb: [
        {
          href: "/definition",
          pageName: "Definition"
        }
      ],
      definitionList: definitions
    };
    res.render("definition/view", assigns);
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
  let catalogName = req.query.catalogName;
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
    catalogName: catalogName
  };
  if (url) {
    requestCore
      .main(url)
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
};

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
  Definition.findOne({ "definitions._id": definitionId }, (err, data) => {
    if (err) {
      throw err;
    }
    if (!data) {
      next();
      return;
    } else {
      let definition = data.definitions.id(definitionId);
      if (!definition) {
        next();
        return;
      }
      assigns.definition = definition;
      assigns.hostname = data.hostname;
      res.render("definition/detail", assigns);
    }
  });
};
