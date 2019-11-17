const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
let config = {
  headers: {
    "User-Agent": "Googlebot/2.1 (+http://www.googlebot.com/bot.html)"
  }
};
const outputFile = "Data_RealEstate.json";
let parsedResults = [];
const scrapePagination = async (
  url,
  paginationUrl,
  listTotal,
  divParent,
  divChild,
  typePagination
) => {
  //p2
  let num = typePagination.replace(/[^0-9]/g, "");
  //.../p2Fr
  let check = paginationUrl.split(url);
  let catalog = check[1].split(typePagination);
  let linkCheck = paginationUrl.split(typePagination);
  let checkURL = await request.get(linkCheck[0], config);
  //
  for (let index = 1;; index++) {
    const html = await request.get(paginationUrl.replace(num, index), config);
    const $ = await cheerio.load(html);
    if ($('.Main').find('.search-productItem').length == 0) {
      break;
    }
    $("div.Main .search-productItem").map((i, el) => {
      // const page = index;
      const title = $(el)
        .find("a")
        .attr("href");
      const metadata = {
        catalog: catalog[0],
        url: url + title
      };
      parsedResults.push(metadata);
    });
    console.log(
      "At the page: " +
        `${chalk.bold.blue(catalog)}` +
        " At number Page: " +
        `${chalk.bold.yellow(index)}`
    );
  }
  exportResults(parsedResults);
};

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

module.exports = scrapePagination;
