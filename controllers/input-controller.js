const request = require("request-promise");
const chalk = require("chalk");
const cheerio = require("cheerio");
const Promise = require("bluebird");

let urlPage;
let listCatalog = [];
let objCatalog = [];
const myMap = new Map();
let formatBody = $ => {
  $("head").append(`<style>
    .crawler-border-solid-selected { border: 2px solid #dee2e6 !important }
    .crawler-border-color-selected { border-color: #28a745!important }
    .crawler-border-solid-hover { border: 2px solid #E67E22 !important }
    .crawler-border-color-hover { border-color: #E67E22  !important }
    .bg-red {background-color: #F39C12 !important}
  </style>`);
};

let getInput = (req, res) => {
  return res.render("input");
};

let postURL = (req, res) => {
  urlPage = req.body.url;
  console.log(urlPage);
  let options = {
    url: urlPage,
    headers: {
      "User-Agent": "Googlebot/2.1 (+http://www.googlebot.com/bot.html)"
    }
  };
  request(options, (error, request, body) => {
    if (error) console.log(error);
    else {
      const $ = cheerio.load(body);
      formatBody($);
      getURL($.root().html(), res);
    }
  });
};
let getURL = (url, res) => {
  return res.render("iframecatalog", { html: url });
};

let postCatalog = (req, res) => {
  let item = JSON.parse(req.body.catalog);
  item.forEach((value, index) => {
    let url = [];
    value.targetList.forEach(el => {
      if (url.includes(urlPage + el) !== true) url.push(urlPage + el);
    });

    if (value !== "/" && value !== "") {
      if (urlPage !== undefined) {
        obj = {
          catalog: value.targetName,
          urlCatalogs: url
        };
      }
      if (objCatalog.includes(obj) !== true) objCatalog.push(obj);
    }
  });

  objCatalog.forEach(el => {
    // console.log(chalk.bold.red(el.urlCatalogs[0]));
    listCatalog.push(el.urlCatalogs[0]);
  });

  // global.urlCatalog = listCatalog[0];
  res.send("Success!");
};
//
let getListPage = (req, res) => {
  var items = [];
  return Promise.map(
    listCatalog,
    function(url) {
      var options = {
        uri: url,
        resolveWithFullResponse: true,
        timeout: 60000,
        jar: true,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36"
        }
      };
      return request(options).then(function(response) {
        const $ = cheerio.load(response.body);
        formatBody($);
        items.push($.root().html());
      });
    },
    { concurrency: 5 }
  ).then(function() {
    handleListPage(items, res);
  });
};
let handleListPage = (urls, res) => {
  myMap.set("urls", urls);
  return res.render("pagelist", {
    listpage: urls[0]
  });
};

module.exports = {
  getInput: getInput,
  getURL: getURL,
  postURL: postURL,
  postCatalog: postCatalog,
  getListPage: getListPage
};
