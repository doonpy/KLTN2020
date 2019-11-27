const Definition = require("../../models/definition-model");
const RawData = require("../../models/raw-data-model");
const DetailUrl = require("../../models/detail-url-model");
const cheerio = require("cheerio");
const async = require("async");
const requestModule = require("../module/request");
const NODE_TYPE_TEXT = 3;
const MAX_REQUEST_SENT = 10;
const ErrorCode = require("../../helper/error-code");
const {parentPort} = require("worker_threads");
const saveSchedule = require("../module/save");
require("../../configs/database-config").init();

let requestCount = 0;
let isPause = false;
let requestLoop = null;

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
      .each(function () {
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
    title.push(getContentByXPath(body, xpath));
  });

  //price
  definition.price.forEach(xpath => {
    price.push(getContentByXPath(body, xpath));
  });

  //acreage
  definition.acreage.forEach(xpath => {
    acreage.push(getContentByXPath(body, xpath));
  });

  //address
  definition.address.forEach(xpath => {
    address.push(getContentByXPath(body, xpath));
  });

  //other
  definition.others.forEach(e => {
    let data = [];
    e.xpath.forEach(xpath => {
      data.push(getContentByXPath(body, xpath));
    });
    othersData.push({
      name: e.name,
      data: data
    });
  });

  return {
    title: title,
    price: price,
    acreage: acreage,
    address: address,
    others: othersData
  };
}

function main(catalogId) {
  async.parallel(
      {
          detailUrls: function (callback) {
              DetailUrl.find({catalogId: catalogId, isExtracted: false}).exec(
                  callback
              );
          },
          definition: function (callback) {
              Definition.findOne({catalogId: catalogId}).exec(callback);
          }
      },
      (err, results) => {
          if (err) {
              sendError(new Error(ErrorCode.DATABASE.DB_ERROR_1));
              return;
          }

          let definition = results.definition;
          let detailUrls = results.detailUrls;
          if (detailUrls.length > 0) {
              requestLoop = setInterval(() => {
                  if (detailUrls.length === 0) {
                      clearInterval(requestLoop);
                      sendMessage({type: "extract-finish"});
                      return;
                  }

                  if (!isPause && requestCount < MAX_REQUEST_SENT) {
                      requestCount++;
                      let detailUrl = detailUrls.shift();
                      requestModule
                          .send(detailUrl.url)
                          .then(res => {
                              requestCount--;
                              let data = {};
                              let dataEntries = Object.entries(
                                  extractData(res.body, definition)
                              );

                              for (const [key, value] of dataEntries) {
                                  value.filter(v => {
                                      return v.length > 0 && v.length !== undefined;
                                  });
                                  data[key] = value;
                              }
                              data.detailUrlId = detailUrl._id;
                              let rawData = new RawData(data);
                              detailUrl.isExtracted = true;

                              saveSchedule.addQueue(rawData);
                              saveSchedule.addQueue(detailUrl);

                              sendMessage({
                                  type: "extract-success",
                                  data: {
                                      url: res.request.uri.href,
                                      statusCode: res.statusCode
                                  }
                              });
                          })
                          .catch(err => {
                              sendError(err);
                          });
                  }
              });
          }
      }
  );
}

// send message to parent
function sendMessage(message) {
  parentPort.postMessage(message);
}

// send error to parent
function sendError(err) {
    parentPort.postMessage({type: "extract-error", data: err.message});
}

// listen message from parent
parentPort.on("message", message => {
  let messageData = message.data;
  let messageType = message.type;
  switch (messageType) {
    case "extract-start":
      main(messageData.catalogId);
      break;
    case "extract-pause":
      isPause = true;
      sendMessage({
        type: "extract-info",
        data: `Pause extract data success...`
      });
      break;
    case "extract-continue":
      isPause = false;
      sendMessage({
        type: "extract-info",
        data: `Continue extract data success...`
      });
      break;
    case "extract-terminate":
      clearInterval(requestLoop);
      let checkLoop = setInterval(() => {
        if (saveSchedule.getRemainAmountQueue() === 0) {
          clearInterval(checkLoop);
            process.exit();
            // sendMessage({type: "extract-terminate", data: true});
        }
      }, 0);
      break;
  }
});
