const fs = require("fs");
const crawlHandle = require("./definition-handler");
const fileHelper = require("../helper/file-helper");

exports.getHtmls = (req, res, next) => {
  let filename = req.params.filename;
  let hostname = req.params.hostname;
  fileHelper
    .getFileContent(`${process.env.STORAGE_PATH}/${hostname}`, filename)
    .then(content => {
      res.send(content);
    })
    .catch(err => {
      next(err);
    });
};

exports.postDefinition = (req, res, next) => {
  let filename = req.body.filename;
  let hostname = req.body.hostname;
  let catalogName = req.body.catalogName;
  let data = JSON.parse(req.body.data);

  crawlHandle.saveDefinition(hostname, filename, catalogName, data);

  res.json({
    message: "Add definition success!",
    status: true
  });
};
