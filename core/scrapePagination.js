const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
const DetailModel = require("../models/detail-url-model");

let config = {
  headers: {
    "User-Agent": "Googlebot/2.1 (+http://www.googlebot.com/bot.html)"
  }
};
//
const detailModel = new DetailModel();
module.exports.scrapeDetail = scrapeDetail = (
  textClass, //Test class
  domain, //batdonsan.com.vn
  pagination,
  urlDetect,
  dataCatalog
) => {
  console.log(textClass);
  let rawData = [];
  let paginationType = domain + pagination;
  let typePagination = paginationType.split(urlDetect);
  let type = typePagination[1];
  let num = type.replace(/[^0-9]/g, "");
  console.log(chalk.bold.yellow(num));
  dataCatalog.forEach(value => {
    let catalog = value.urlCatalogs;
    rawData.push(catalog);
    // crawlerPagination(textClass, type, paginationType, catalog, num, domain);
  });
  rawData = [].concat.apply([], rawData);

  crawlerPagination(textClass, type, rawData, num, domain);
};
//
let parsedResults = [];
const crawlerPagination = async (textClass, type, rawData, num, domain) => {
  let urlmodel = domain.split(/^https?\:\/\//i);
  let checkLoop = true;
  let flagIndex = 0;
  let url;
  while (checkLoop) {
    url = rawData[flagIndex];
    let textDetail = url + type;
    console.log(chalk.bold.blue(url));
    let arrLink = [];
    for (let index = 1; index <= 100; index++) {
      const html = await request.get(textDetail.replace(num, index), config);
      const $ = await cheerio.load(html);
      //
      let link = [];
      $(`.${textClass}`).each(function() {
        link.push({
          url:
            domain +
            $(this)
              .find("a")
              .attr("href"),
          isExtracted: false
        });
      });
      arrLink.push(link);
      console.log("At the number:  " + chalk.bold.blue(index));
      // if ($("body").find(`.${textClass}`).length === 0) {
      //   flagIndex += 1;
      //   break;
      // }
      if (index === 100) {
        flagIndex += 1;
      }
      if (flagIndex == rawData.length - 1) {
        checkLoop = false;
        console.log(chalk.bold.red("BAN DA HOAN THANH!!!!"));
      }
      // let val = url.split(domain);
      // let name = val[1].replace("/", "");
    }

    let mergeLinkArr = [].concat.apply([], arrLink);

    let catalogList = {
      catalogName: url,
      urlList: mergeLinkArr
    };
    parsedResults.push(catalogList);
    DetailModel.findOneAndUpdate(
      { domain: urlmodel[1] },
      {
        $push: {
          catalogList: parsedResults
        }
      }
    ).exec();
    parsedResults = [];
  }
  // console.log(urlmodel[1]);
};
//
// const exportResults = parsedResults => {
//   fs.writeFile(outputFile, JSON.stringify(parsedResults, null, 4), err => {
//     if (err) {
//       console.log(err);
//     }
//     console.log(
//       chalk.yellow.bgBlue(
//         `\n ${chalk.underline.bold(
//           parsedResults.length
//         )} Results exported successfully to ${chalk.underline.bold(
//           outputFile
//         )}\n`
//       )
//     );
//   });
// };
