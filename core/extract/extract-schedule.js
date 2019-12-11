require("../../configs/database-config").init();
const Definition = require("../../models/definition-model");
const RawData = require("../../models/raw-data-model");
const DetailUrl = require("../../models/detail-url-model");
const ExtractLog = require("../../models/extract-log-model");
const cheerio = require("cheerio");
const async = require("async");
const requestModule = require("../module/request");
const nodeSchedule = require("node-schedule");
const timeHelper = require("../../helper/time");

let curDate = new Date();
curDate.setDate(curDate.getDate() - 7);
const DATE_LIMIT = new Date(curDate); // 1 week from present
const NODE_TYPE_TEXT = 3;
const MAX_URL_TO_GET = 8000;
const MAX_REQUEST_SENT = 10;
const MAX_REQUEST_RETRIES = 3;
const SAVE_AMOUNT = 30;
const REPEAT_TIME = {
  EXTRACT: 60 * 60, //seconds
  SAVE: 10 //seconds
};
const JOB_REPEAT_TIME = "0 0 */1 * * * "; //Execute every 1 hours
let rawDataSaveQueue = [];
let detailUrlUpdateQueue = [];

nodeSchedule.scheduleJob(JOB_REPEAT_TIME, main);

/**
 * Main function
 */
function main() {
  const hrStart = process.hrtime();
  async.parallel(
    {
      definitions: function(callback) {
        Definition.find().exec(callback);
      },
      detailUrls: function(callback) {
        DetailUrl.aggregate([
          {
            $match: {
              cTime: { $gte: DATE_LIMIT }
            }
          },
          {
            $match: {
              isExtracted: false
            }
          },
          {
            $limit: MAX_URL_TO_GET
          },
          {
            $match: {
              requestRetries: {
                $lt: MAX_REQUEST_RETRIES
              }
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
          }
        ]).exec(callback);
      }
    },
    (err, data) => {
      if (err) {
        console.log(
          `=> [M${process.pid} - ${require("moment")().format(
            "L LTS"
          )}] Extract error: ${err.message}`
        );
        return;
      }

      let { definitions, detailUrls } = data;
      let urls = [];
      let requestAmount = detailUrls.length;
      let successAmount = 0;
      let failedAmount = 0;
      let requestCount = 0;

      if (detailUrls.length === 0) {
        return;
      }

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
          }).save(err => {
            if (err) {
              console.log(
                `=> [M${process.pid} - ${require("moment")().format(
                  "L LTS"
                )}] Extract log > Save failed: ${err.message}`
              );
            } else {
              console.log(
                `=> [M${process.pid} - ${require("moment")().format(
                  "L LTS"
                )}] Extract worker was ran within ${timeHelper.secondsToHms(
                  hrEnd
                )}! Next time at ${require("moment")()
                  .add(REPEAT_TIME.EXTRACT, "seconds")
                  .format("L LTS")}`
              );
            }
          });
          return;
        }
        if (requestCount < MAX_REQUEST_SENT) {
          let detailUrl = detailUrls.shift();
          if (detailUrl.isDefined === false) {
            return;
          }
          let definition = definitions.find(
            def => def.catalogId.toString() === detailUrl.catalogId.toString()
          );

          if (definition) {
            requestCount++;
            requestModule
              .send(detailUrl.url)
              .then(res => {
                // console.log(
                //   `=> [M${process.pid} - ${require("moment")().format(
                //     "L LTS"
                //   )}] Extract "${res.request.uri.href}" - ${res.statusCode}`
                // );
                let dataExtracted = extractData(res.body, definition);
                detailUrl.isExtracted = true;
                detailUrl.requestRetries++;
                dataExtracted.detailUrlId = detailUrl._id;

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
                // console.log(
                //   `=> [M${process.pid} - ${require("moment")().format(
                //     "L LTS"
                //   )}] Extract "${detailUrl.url}" - ${err.message}`
                // );

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
}

/**
 * Loop update database
 */
let saveLoop = setInterval(() => {
  let rawDataSaveQueueLength = rawDataSaveQueue.length;
  let detailUrlUpdateQueueLength = detailUrlUpdateQueue.length;

  if (rawDataSaveQueueLength === 0 && detailUrlUpdateQueueLength === 0) {
    return;
  }

  let rawDataContainer =
    rawDataSaveQueueLength > SAVE_AMOUNT
      ? rawDataSaveQueue.splice(0, SAVE_AMOUNT)
      : rawDataSaveQueue.splice(0, rawDataSaveQueueLength);
  let detailUrlContainer =
    detailUrlUpdateQueueLength > SAVE_AMOUNT
      ? detailUrlUpdateQueue.splice(0, SAVE_AMOUNT)
      : detailUrlUpdateQueue.splice(0, detailUrlUpdateQueueLength);

  RawData.insertMany(rawDataContainer, { ordered: false }, (err, docs) => {
    if (err) {
      console.log(
        `=> [M${process.pid} - ${require("moment")().format(
          "L LTS"
        )}] Extract worker > Save raw data error: ${err.message}`
      );
    }
  });

  detailUrlContainer.forEach(d => {
    DetailUrl.findByIdAndUpdate(d._id, d, err => {
      if (err) {
        console.log(
          `=> [M${process.pid} - ${require("moment")().format(
            "L LTS"
          )}] Extract worker > Save detail URL error: ${err.message}`
        );
      }
    });
  });
}, 1000 * REPEAT_TIME.SAVE);

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
          .replace(/(\r\n|\n|\r)/gm, "");
        if (text !== "" || text !== null) textData += `${text} `;
      }
    });

  return textData.trim();
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
