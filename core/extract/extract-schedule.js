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
const MAX_REQUEST_SENT = 10;
const REPEAT_TIME = {
  EXTRACT: 60 * 60, // minutes
  SAVE: 10 //seconds
};
const SAVE_AMOUNT = 20;
let saveQueue = [];

(function extractLoop() {
  const hrStart = process.hrtime();
  async.parallel(
    {
      definitions: function(callback) {
        Definition.find().exec(callback);
      },
      detailUrls: function(callback) {
        DetailUrl.find({ isExtracted: false })
          .limit(MAX_URL_TO_GET)
          .exec(callback);
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
                requestCount--;
                let dataExtracted = extractData(res.body, definition);
                detailUrl.isExtracted = true;

                saveQueue.push(new RawData(dataExtracted));
                saveQueue.push(detailUrl);

                urls.push({ id: detailUrl._id, isSuccess: true });
                successAmount++;
              })
              .catch(err => {
                requestCount--;
                urls.push({ id: detailUrl._id, isSuccess: false });
                failedAmount++;
              });
          }
        }
      }, 0);
    }
  );
  setTimeout(extractLoop, REPEAT_TIME.EXTRACT * 1000);
})();

(function saveLoop() {
  if (saveQueue.length > 0) {
    let data;

    if (saveQueue.length < SAVE_AMOUNT) {
      data = saveQueue.splice(0, saveQueue.length);
    } else {
      data = saveQueue.splice(0, SAVE_AMOUNT);
    }

    data.forEach(e => {
      e.save(err => {
        if (err) {
          console.log(
            `=> [W${process.pid} - ${require("moment")().format(
              "L LTS"
            )}] Save worker: ${err.message}`
          );
        }
      });
    });
    console.log(
      `=> [W${process.pid} - ${require("moment")().format(
        "L LTS"
      )}] Save worker was executed. Queue remain amount is ${
        saveQueue.length
      }`
    );
  }
  setTimeout(saveLoop, REPEAT_TIME.SAVE * 1000);
})();

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
