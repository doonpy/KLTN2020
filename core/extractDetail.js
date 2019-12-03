const request = require("request-promise");
const cheerio = require("cheerio");
const chalk = require("chalk");
let options = {
  headers: {
    "User-Agent": "Googlebot/2.1 (+http://www.googlebot.com/bot.html)"
  },
  resolveWithFullResponse: true,
  timeout: 60000,
  jar: true
};
//
module.exports.getDetail = getDetail = (url, xpath) => {
  console.log(url);
  console.log(xpath);
  return new Promise((resolve, reject) => {
    return request(url, options, (error, request, body) => {
      if (error) console.log(error);
      result = getAttrbyXpath(body, xpath);
      resolve(result);
    });
  });
};
//
module.exports.getPagination = getPagination = (paginationXpath, url) => {
  console.log(paginationXpath);
  console.log(url);
  return new Promise((resolve, reject) => {
    return request(url, options, (error, request, body) => {
      if (error) console.log(error);
      result = getPaginationbyXpath(body, paginationXpath);
      resolve(result);
    });
  });
};
//
function getAttrbyXpath(body, xpath) {
  const $ = cheerio.load(body);
  let selector = getContentbyXpath($, xpath);
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
  return classParrent;
}
//
function getPaginationbyXpath(body, paginationXpath) {
  console.log(chalk.bold.yellow(paginationXpath));
  const $ = cheerio.load(body);

  let selector = getContentbyXpath($, paginationXpath);

  let pagination = $(selector);

  let textPagination = "";
  let flagcheckPagination = true;
  let textData = $(selector).attr("href");
  
  if (textData !== undefined) {
    textPagination = textData;
  } else {
    while (flagcheckPagination) {
      pagination = $(pagination).parent();
      if ($(pagination).attr("href") !== undefined) {
        flagcheckPagination = false;
        textPagination = $(pagination).attr("href");
      }
    }
    console.log("textPagination : " + chalk.bold.red(textPagination));
  }

  return textPagination;
}
//
function getContentbyXpath($, xpath) {
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
