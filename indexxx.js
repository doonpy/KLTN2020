const cheerio = require("cheerio");
const request = require("request-promise");

function getContentByXPath(body, xpath) {
  const $ = cheerio.load(body);
  let xpathArray = xpath.split("/");
  let selector = $("*");
  let tagName = "";
  let index = 0;

  xpathArray.splice(0, 2); //remove null and html element

  while (xpathArray.length > 0) {
    let firstElement = xpathArray.shift();

    tagName = firstElement.match(/[a-z]+([1-6])?/g)[0];
    index = firstElement.match(/\[[0-9]+\]/g)
      ? firstElement.match(/\[[0-9]+\]/g)[0].replace(/\[+|\]+/g, "") - 1
      : 0;

    selector = $(selector)
      .children(tagName)
      .get(index);
  }

  let textData = "";
  $(selector)
    .contents()
    .each(function() {
      if (this.nodeType === NODE_TYPE_TEXT) {
        let text = $(this)
          .text()
          .trim()
          .replace(/\n\r/g, "");
        if (text !== "" || text !== null) textData += text;
      }
    });

  return textData;
}
