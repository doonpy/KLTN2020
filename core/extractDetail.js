const request = require("request-promise");
const cheerio = require("cheerio");
const chalk = require("chalk");
const options = {
  resolveWithFullResponse: true,
  timeout: 60000,
  jar: true,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36"
  }
};
const extractDetail = (url, xpath) => {
  let resultDetail = "";
  request(url, options, (err, request, body) => {
    if (err) console.error(err);
    else {
      resultDetail = getAttrByXpath(body, xpath);
    }
  });
  console.log(chalk.bold.red(resultDetail));
  // return resultDetail;
};
// const extractPagination = (url, paginationXpath) => {
//   request(url, options, (err, request, body) => {
//     if (err) console.error(err);
//     else {
//       getPagination(body, paginationXpath);
//     }
//   });
// };

function getAttrByXpath(body, xpath) {
  const $ = cheerio.load(body);
  let selector = extractXpath(xpath, $)
  let sibling = $(selector);
  let flagCheckHasParent = true;
  let classParrent = "";
  while (flagCheckHasParent) {
    sibling = $(sibling).parent();
    if ($(sibling).attr("class") !== undefined) {
      flagCheckHasParent = false;
      classParrent = $(sibling).attr("class");
    }
  }
  console.log(chalk.bold.blue(classParrent));
  return classParrent;
}
function getPagination(body, paginationXpath) {
  let $ = cheerio.load(body);
  let paginationQuery = extractXpath(body, paginationXpath);
  let flagcheckPagination = true;
  let textPagination = "";
  while (flagcheckPagination) {
    paginationQuery = $(paginationQuery).parent();
    if ($(paginationQuery).attr("href") !== undefined) {
      flagcheckPagination = false;
      textPagination = $(paginationQuery).attr("href");
    }
  }
  return textPagination;
}
function extractXpath(xpath, $) {
  let xpathArray = xpath.split("/");
  let tagName = "";
  let index = 0;
  let selector = $("*");
  xpathArray.splice(0, 2); //remove null and html element
  for (let i in xpathArray) {
    let firstElement = xpathArray[i];
    tagName = firstElement.match(/[a-z]+([1-6])?/g)[0];
    index = firstElement.match(/\[[0-9]+\]/g)
      ? firstElement.match(/\[[0-9]+\]/g)[0].replace(/\[+|\]+/g, "") - 1
      : 0;
    selector = $(selector)
      .children(tagName)
      .get(index);
  }
  return selector;
}
module.exports = {
  extractDetail: extractDetail
  // extractPagination: extractPagination
};
