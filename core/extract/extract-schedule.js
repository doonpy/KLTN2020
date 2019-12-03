require("../../configs/database-config").init();
const Definition = require("../../models/definition-model");
const RawData = require("../../models/raw-data-model");
const DetailUrl = require("../../models/detail-url-model");
const ExtractLog = require("../../models/extract-log-model");
const cheerio = require("cheerio");
const async = require("async");
const requestModule = require("../module/request");

const NODE_TYPE_TEXT = 3;
const MAX_URL_TO_GET = 6000;
const MAX_REQUEST_SENT = 20;
const MAX_REQUEST_RETRIES = 3;
const SAVE_AMOUNT = 60;
let rawDataSaveQueue = [];
let detailUrlUpdateQueue = [];

(function extractLoop() {
  const hrStart = process.hrtime();
  async.parallel(
    {
      definitions: function(callback) {
        Definition.find().exec(callback);
      },
      detailUrls: function(callback) {
        DetailUrl.aggregate([
          [
            {
              $match: {
                isExtracted: false
              }
            },
            {
              $match: {
                requestRetries: { $lt: MAX_REQUEST_RETRIES }
              }
            },
            {
              $lookup: {
                from: "definitions",
                localField: "catalogId",
                foreignField: "catalogId",
                as: "definition"
              }
            },
            {
              $project: {
                url: 1,
                isExtracted: 1,
                catalogId: 1,
                cTime: 1,
                eTime: 1,
                requestRetries: 1,
                isDefined: {
                  $gt: [
                    {
                      $size: "$definition"
                    },
                    0
                  ]
                }
              }
            },
            {
              $match: {
                isDefined: true
              }
            },
            {
              $limit: MAX_URL_TO_GET
            }
          ]
        ]).exec(callback);
      }
    },
    (err, data) => {
      if (err) {
        throw err;
      }

      let { definitions, detailUrls } = data;
      let urls = [];
      let requestAmount = detailUrls.length;
      let successAmount = 0;
      let failedAmount = 0;
      let requestCount = 0;

      let requestLoop = setInterval(() => {
        if (detailUrls.length === 0) {
          clearInterval(requestLoop);
          const hrEnd = process.hrtime(hrStart)[0];
          new ExtractLog({
            urls: urls,
            requestAmount: requestAmount,
            successAmount: successAmount,
            failedAmount: failedAmount,
            executeTime: hrEnd
          }).save();
          console.log(
            `=> [M${process.pid} - ${require("moment")().format(
              "L LTS"
            )}] Extractor was ran within ${secondsToHms(hrEnd)}`
          );
          extractLoop();
          return;
        }
        if (requestCount < MAX_REQUEST_SENT) {
          let detailUrl = detailUrls.shift();
          let definition = definitions.find(
            def => def.catalogId.toString() === detailUrl.catalogId.toString()
          );

          if (definition) {
            requestCount++;
            requestModule
              .send(detailUrl.url)
              .then(res => {
                console.log(
                  `=> [M${process.pid} - ${require("moment")().format(
                    "L LTS"
                  )}] Extract "${res.request.uri.href}" - ${res.statusCode}`
                );
                let dataExtracted = extractData(res.body, definition);
                detailUrl.isExtracted = true;
                detailUrl.requestRetries++;
                dataExtracted.detailUrl=detailUrl._id;

                if (!isNullData(dataExtracted)) {
                  rawDataSaveQueue.push(dataExtracted);
                  detailUrlUpdateQueue.push(detailUrl);

                  // log
                  requestCount--;
                  urls.push({ id: detailUrl._id, isSuccess: true });
                  successAmount++;
                } else {
                  detailUrlUpdateQueue.push(detailUrl);
                  // log
                  requestCount--;
                  urls.push({
                    id: detailUrl._id,
                    isSuccess: false,
                    errorCode: new Error("Null data")
                  });
                  failedAmount++;
                }
              })
              .catch(err => {
                console.log(
                  `=> [M${process.pid} - ${require("moment")().format(
                    "L LTS"
                  )}] Extract "${detailUrl.url}" - ${err.message}`
                );

                detailUrl.requestRetries++;
                detailUrlUpdateQueue.push(detailUrl);

                // log
                requestCount--;
                urls.push({
                  id: detailUrl._id,
                  isSuccess: false,
                  errorCode: err.message
                });
                failedAmount++;
              });
          }
        }
      }, 0);
    }
  );
})();

/**
 * Loop update database
 */
setInterval(() => {
  if (rawDataSaveQueue.length >= SAVE_AMOUNT) {
    RawData.insertMany(rawDataSaveQueue, { ordered: false }, err => {
      if (err) {
        console.log(
          `=> [M${process.pid} - ${require("moment")().format(
            "L LTS"
          )}] Extract > Save error: ${err.message}`
        );
      }
      rawDataSaveQueue = [];
    });
  }

  if (detailUrlUpdateQueue.length >= SAVE_AMOUNT) {
    detailUrlUpdateQueue.forEach(d => {
      DetailUrl.findByIdAndUpdate(d._id, d, err => {
        if (err) {
          console.log(
            `=> [M${process.pid} - ${require("moment")().format(
              "L LTS"
            )}] Extract > Save error: ${err.message}`
          );
        }
      });
    });
    detailUrlUpdateQueue = [];
  }
}, 100);

function isNullData(data) {
  const { title, price, acreage, address } = data;
  if (
    title.length === 0 &&
    price.length === 0 &&
    acreage.length === 0 &&
    address.length === 0
  ) {
    return true;
  }
  return false;
}

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
          .replace(/(\r\n|\n|\r)/gm, "");
        if (text !== "" || text !== null) textData += ` ${text.trim()}`;
      }
    });

  return textData;
}

function extractData(body, definition) {
  let title = [];
  let price = [];
  let acreage = [];
  let address = [];
  let othersData = [];

  //title
  definition.title.forEach(xpath => {
    if (getContentByXPath(body, xpath) !== "") {
      title.push(getContentByXPath(body, xpath));
    }
  });

  //price
  definition.price.forEach(xpath => {
    if (getContentByXPath(body, xpath) !== "") {
      price.push(getContentByXPath(body, xpath));
    }
  });

  //acreage
  definition.acreage.forEach(xpath => {
    if (getContentByXPath(body, xpath) !== "") {
      acreage.push(getContentByXPath(body, xpath));
    }
  });

  //address
  definition.address.forEach(xpath => {
    if (getContentByXPath(body, xpath) !== "") {
      address.push(getContentByXPath(body, xpath));
    }
  });

  //other
  definition.others.forEach(e => {
    let data = [];
    e.xpath.forEach(xpath => {
      if (getContentByXPath(body, xpath) !== "") {
        data.push(getContentByXPath(body, xpath));
      }
    });

    if (data.length !== 0) {
      othersData.push({
        name: e.name,
        data: data
      });
    }
  });

  return {
    title: title,
    price: price,
    acreage: acreage,
    address: address,
    others: othersData
  };
}

function secondsToHms(d) {
  d = Number(d);
  let h = Math.floor(d / 3600);
  let m = Math.floor((d % 3600) / 60);
  let s = Math.floor((d % 3600) % 60);

  let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return hDisplay + mDisplay + sDisplay;
}
