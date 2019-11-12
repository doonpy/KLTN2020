const fs = require("fs");
const crawlHandle = require("./crawl-handle");
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
  let url = req.body.url;
  let host = req.body.host;
  let data = JSON.parse(req.body.dataString);

  crawlHandle.saveDefinition(host, url, data);

  res.json({
    status: "success"
  });
};
