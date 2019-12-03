const fileHelper = require("../helper/file-helper");
const Definition = require("../models/definition-model");

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

exports.getDefinitionById = (req, res, next) => {
  let definitionId = req.params.definitionId;
  Definition.findOne({ _id: definitionId }).exec((err, definition) => {
    if (err) {
      res.json({
        status: false,
        error: err
      });
      return;
    }
    if (!definition) {
      res.json({
        status: false,
        error: new Error("Definition not found!")
      });
    } else {
      res.json({
        status: true,
        data: definition
      });
    }
  });
};
