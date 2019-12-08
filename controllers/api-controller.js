const fileHelper = require("../helper/file-helper");
const Definition = require("../models/definition-model");
const targetHtmlHelper = require("../helper/target-html-handle");
const requestModule = require("../core/module/request");

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

exports.createTempHtmlFile = (req, res, next) => {
  let url = req.query.url;
  let enableScript = parseInt(req.query.enableScript);

  requestModule
      .send(url)
      .then(response => {
        const folderPath = `${process.env.STORAGE_PATH}/${response.request.uri.host}`;
        const bodyHtml = targetHtmlHelper.handleLinkFile(response, enableScript);
        fileHelper
            .createFile(folderPath, `${url}.html`, bodyHtml, true)
            .then(fileName => {
              res.json({
                status: true,
                filePath: `/api/get-html/${response.request.uri.host}/${fileName}`
              });
            })
            .catch(err => {
              res.json({
                status: false,
                error: err.message
              });
            });
      })
      .catch(err => {
        res.json({
          status: false,
          error: err.message
        });
      });
};

exports.getDefinitionById = (req, res, next) => {
  let definitionId = req.params.definitionId;
  Definition.findOne({_id: definitionId}).exec((err, definition) => {
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
