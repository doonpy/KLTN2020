const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
const outputFile = "database.JSON";
let config = {
  headers: {
    "User-Agent": "Googlebot/2.1 (+http://www.googlebot.com/bot.html)"
  }
};
//
module.exports.scrapeDetail = scrapeDetail = (
  textClass,
  domain,
  pagination,
  urlDetect,
  dataCatalog
) => {
  console.log(textClass);
  let paginationType = domain + pagination;
  let typePagination = paginationType.split(urlDetect);
  let type = typePagination[1];
  let num = type.replace(/[^0-9]/g, "");
  console.log(chalk.bold.yellow(num));
  dataCatalog.forEach(value => {
    let catalog = value.urlCatalogs;
    console.log(catalog);
    crawlerPagination(textClass, type, paginationType, catalog, num, domain);
  });
};
//
let parsedResults = [];
const crawlerPagination = (
  textClass,
  type,
  paginationType,
  catalog,
  num,
  domain
) => {
  //
  catalog.forEach(async value => {
    let textDetail = value + type;
    console.log(textDetail);
    for (let index = 1; ; index++) {
      const html = await request.get(textDetail.replace(num, index), config);
      const $ = cheerio.load(html);
      if ($("body").find(`.${textClass}`).length == 0) {
        break;
      }
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
      let val = value.split(domain);
      let name = val[1].replace("/", "");
      //
      let catalogList = {
        catalogName: name,
        urlList: link
      };

      // let database = {
      //   domain: domain,
      //   catalogList: [
      //     {
      //       catalogName: name,
      //       urlList: link //Array
      //       // isExtracted: false
      //     }
      //   ]
      // };

      console.log(" At number Page: " + `${chalk.bold.yellow(index)}`);
      parsedResults.push(catalogList);
    }
    exportResults(parsedResults);
  });
};
//
const exportResults = parsedResults => {
  fs.writeFile(outputFile, JSON.stringify(parsedResults, null, 4), err => {
    if (err) {
      console.log(err);
    }
    console.log(
      chalk.yellow.bgBlue(
        `\n ${chalk.underline.bold(
          parsedResults.length
        )} Results exported successfully to ${chalk.underline.bold(
          outputFile
        )}\n`
      )
    );
  });
};
