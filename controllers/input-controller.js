const request = require("request-promise");
const chalk = require("chalk");
const cheerio = require("cheerio");
const Promise = require("bluebird");
const extract = require("../core/extractDetail");
const scrape = require("../core/scrapePagination");
const HostnameModel = require("../models/host-model");
const CatalogModel = require("../models/catalog-model");
let listCatalog = [];

const myMap = new Map();
const myHost = new Map();
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
  return res.render("input/input");
};

let postURL = async (req, res) => {
  let urlPage = req.body.url;
  
  let urlmodel = await urlPage.split(/^https?\:\/\//i);
  global.urlPage = urlPage;

  let result = await HostnameModel.findOne({ name: urlmodel[1] });
  myHost.set("host", urlmodel[1]);
  console.log(result);
  if (!result) {
    HostnameModel.create({
      name: urlmodel[1]
    });
  } else {
    console.log("Already Exist!");
  }
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
  return res.render("input/iframecatalog", { html: url });
};

let postCatalog = async (req, res) => {
  let item = JSON.parse(req.body.catalog);
  let hostname = myHost.get("host");
  const host = await HostnameModel.findOne({ name: hostname });

  let catalogs = [];
  item.forEach(async (value, index) => {
    catalogs.push(urlPage + value.href);
    const countUrl = await CatalogModel.countDocuments({
      name: value.name,
      link: urlPage + value.href,
      hostId: host._id
    });
    if (!countUrl) {
      CatalogModel.create({
        name: value.name,
        link: urlPage + value.href,
        hostId: host._id
      })
        .then(() => {
          console.log(`=> Save Data in ${value.name} successful!`);
        })
        .catch(err => {
          console.log("=> Save data failed!\n", err);
        });
    }
  });
  listCatalog.push(catalogs[0]);
  global.catalogs = catalogs;
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
//
let handleListPage = (urls, res) => {
  myMap.set("urls", urls);
  return res.render("input/pagelist", {
    listpage: urls
  });
};
let getDetailPage = async (req, res) => {
  let xpath = JSON.parse(req.body.xPathArray);
  let paginationArr = JSON.parse(req.body.paginationXpath);
  let urlDetect = listCatalog[0];
  let xPath = xpath[0];

  //
  // console.log(paginationArr);
  // console.log(urlDetect);
  // console.log(xpath)
  res.send("Success!");
  let paginationXpath = paginationArr[0];

  let textClass = await extract.getDetail(urlDetect, xPath);
  console.log("Class : " + textClass);
  let pagination = await extract.getPagination(paginationXpath, urlDetect);
  console.log("Pagination : " + pagination);
  console.log(chalk.bold.blue("RUNNNNNN"));
  console.log(catalogs);
  let hostname = myHost.get("host");
  console.log(hostname);
  setTimeout(() => {
    scrape.scrapeDetail(textClass, urlPage, pagination, urlDetect, catalogs);
  }, 1000);
};
module.exports = {
  getInput: getInput,
  getURL: getURL,
  postURL: postURL,
  postCatalog: postCatalog,
  getListPage: getListPage,
  getDetailPage: getDetailPage
};
