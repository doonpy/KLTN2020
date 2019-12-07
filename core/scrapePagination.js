const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
const DetailModel = require("../models/detail-url-model");

const CatalogModel = require("../models/catalog-model");
let config = {
  headers: {
    "User-Agent": "Googlebot/2.1 (+http://www.googlebot.com/bot.html)"
  }
};
//
module.exports.scrapeDetail = scrapeDetail = (
  textClass, //Test classoi
  domain, //batdonsan.com.vn
  pagination,
  urlDetect,
  dataCatalog
) => {
  let paginationType = domain + pagination;
  let typePagination = "";

  let type = "";
  if (urlDetect.includes(".html")) {
    let testtypePagination = urlDetect.split(".html");
    typePagination = paginationType.split(testtypePagination[0]);
    type = typePagination[1];
  } else if (urlDetect.includes(".htm")) {
    let testtypePagination = urlDetect.split(".htm");
    typePagination = paginationType.split(testtypePagination[0]);
    type = typePagination[1];
  } else {
    typePagination = paginationType.split(urlDetect);
    type = typePagination[1];
  }
  // console.log("types : " + typePagination);
  // console.log("Pagination Type : " + paginationType);
  //console.log(num);
  console.log("Type Undefine: " + chalk.bold.red(type)); // undefine
  //Hàm tách số
  let num = getNumberPagi(type);
  //

  console.log("NUMBER" + chalk.bold.yellow(num));

  crawlerPagination(textClass, type, dataCatalog, num, domain);
};
//

const crawlerPagination = async (textClass, type, rawData, num, domain) => {
  let checkLoop = true;
  let flagIndex = 0;
  let url;

  while (checkLoop) {
    //
    url = rawData[flagIndex];
    let textDetail = "";
    if (url.includes(".html")) {
      let testUrl = url.split(".html");
      textDetail = testUrl[0].trim() + type.trim();
    } else if (url.includes(".htm")) {
      let testUrl = url.split(".htm");
      textDetail = testUrl[0].trim() + type.trim();
    } else {
      textDetail = url + type.trim();
    }
    console.log(textDetail);
    console.log(chalk.bold.blue(url));
    let arrLink = [];
    const catalogName = await CatalogModel.findOne({ link: url });
    console.log(catalogName);
    for (let index = 1; index <= 200; index++) {
      console.log(chalk.bold.red(textDetail.replace(num, index)));
      const html = await request.get(textDetail.replace(num, index), config);

      const $ = await cheerio.load(html);

      let link = [];
      $(`.${textClass}`).each(function() {
        let href = $(this)
          .find("a")
          .attr("href")
          .includes(domain);
        if (!href) {
          link.push({
            url:
              domain +
              $(this)
                .find("a")
                .attr("href"),
            isExtracted: false,
            catalogId: catalogName._id
          });
        } else {
          link.push({
            url: $(this)
              .find("a")
              .attr("href"),
            isExtracted: false,
            catalogId: catalogName._id
          });
        }
      });
      arrLink.push(link);

      // console.log("At the number:  " + chalk.bold.blue(index));
      if ($("body").find(`.${textClass}`).length === 0) {
        flagIndex += 1;
        break;
      }
      if (index === 200) {
        flagIndex += 1;
      }
      if (flagIndex == rawData.length - 1) {
        checkLoop = false;
      }
      // let val = url.split(domain);
      // let name = val[1].replace("/", "");
    }

    let mergeLinkArr = [].concat.apply([], arrLink);
    console.log(mergeLinkArr.length);

    await DetailModel.create(mergeLinkArr)
      .then(() => {
        console.log(`=> Save Data in ${url} successful!`);
      })
      .catch(err => {
        console.log("=> Save data failed!\n", err);
      });
  }
};
function getNumberPagi(strTypePagination) {
  let textData = "";
  for (var x = 0, c = ""; (c = strTypePagination.charAt(x)); x++) {
    // console.log(c);
    if (!isNaN(c)) {
      textData = c;
      //  console.log(c);
      break;
    }
  }
  return textData;
}
