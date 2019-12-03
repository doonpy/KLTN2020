const crawler = require("../core/crawler");
const DefData = require("../models/definition-model");
const CrawlHistory = require("../models/crawl-history-model");
const fs = require("fs");
// const extractCore = require("../core/extract");
const fileHelper = require("../helper/file-helper");

exports.postCrawl = (req, res, next) => {
  let links = req.body.links.split(/\n+|\r+/);

  links = links.filter(link => {
    return link !== "";
  });

  crawler.main(links);
  res.render("crawl");
};

exports.getCrawl = (req, res, next) => {
  res.render("crawl");
};

exports.getDefinition = (req, res, next) => {
  let hostname = req.params.hostname;

  DefData.findOne({ hostname: hostname }, (err, def) => {
    if (err) throw err;

    if (!def) {
      let folderPath = `${process.env.STORAGE_PATH}/${hostname}`;

      fs.access(folderPath, err => {
        if (err && err.code === "ENOENT") {
          res.send("Host has not crawl yet!");
          return;
        }
        fs.readdir(folderPath, (err, files) => {
          if (err) throw err;

          if (files.length === 0)
            res.send(`${hostname} not have file to extract!`);
          else
            res.render("not-definition", {
              hostname: hostname,
              file: files[0]
            });
        });
      });
    } else {
      // res.render("definition", { definition: def });
      res.json(def);
    }
  });
};

// exports.getExtract = (req, res, next) => {
//     let hostname = req.params.hostname;
//
//     DefData.findOne({host: hostname}, async (err, found) => {
//         if (err) next(err);
//
//         if (!found) {
//             res.redirect(`/definition/${hostname}`);
//             return;
//         }
//
//         let folderPath = hostname;
//         let isFolderExist = await fileHelper.isFolderExist(folderPath);
//         if (isFolderExist) {
//             let files = await fileHelper.getAllFileInFolder(folderPath);
//             if (files.length > 0) {
//                 files.forEach(fileName => {
//                     CrawlHistory.findOne(
//                         {filename: fileName.replace(/\.html$/g, "")},
//                         async (err, found) => {
//                             if (err) next(err);
//                             if (found) {
//                                 let content = await fileHelper.getFileContent(
//                                     folderPath,
//                                     fileName
//                                 );
//                                 extractCore.main(hostname, found.url, content);
//                             }
//                         }
//                     );
//                 });
//                 res.send("OK");
//             }
//         }
//     });
// };
