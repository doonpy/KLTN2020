const fs = require("fs");
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


