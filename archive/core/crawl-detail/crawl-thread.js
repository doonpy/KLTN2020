require("../../configs/database-config").init();
const DetailUrl = require("../../models/detail-url-model");
const CrawlDetailLog = require("../../models/crawl-detail-log-model");
const requestModule = require("../module/request");
const { workerData, parentPort } = require("worker_threads");
const cheerio = require("cheerio");

const REPEAT_TIME = {
  SAVE: 30 //seconds
};
const SAVE_AMOUNT = 100;
const SIMILAR_PERCENT = 80;
const MAX_REQUEST_SENT = 10;
const MAX_REQUEST_RETRIES = 3;
const MAX_URL_AMOUNT_PER_CRAWL = 1000;
const catalog = JSON.parse(workerData);
const hrStart = process.hrtime();
let urlQueue = {
  success: [],
  waiting: [],
  failed: []
};
let saveQueue = [];
let existDetailUrls = [];
let currentSaveAmount = 0;

DetailUrl.find({ catalogId: catalog._id }).exec((err, detailUrls) => {
  if (err) {
    console.log(
      `=> [M${process.pid} - ${require("moment")().format(
        "L LTS"
      )}] Crawl detail URL worker > Get exist detail URL failed: ${
        err.message
      } `
    );
    parentPort.postMessage(JSON.stringify({ status: true, catalog: catalog }));
  } else {
    existDetailUrls = detailUrls;
    main();
  }
});

/**
 * Main function
 */
function main() {
  let catalogHref = catalog.href;
  let requestAmount = 0;

  urlQueue.waiting.push({
    url: catalogHref,
    retries: 0
  });

  const loop = setInterval(() => {
    if (
      (urlQueue.waiting.length === 0 && requestAmount === 0) ||
      currentSaveAmount >= MAX_URL_AMOUNT_PER_CRAWL
    ) {
      clearInterval(loop);
      urlQueue.executeTime = process.hrtime(hrStart)[0];
      urlQueue.urlAmount = currentSaveAmount;
      urlQueue.catalogId = catalog._id;
      new CrawlDetailLog(urlQueue).save(err => {
        if (err) {
          console.log(
            `=> [M${process.pid} - ${require("moment")().format(
              "L LTS"
            )}] Crawl detail URL worker > Save log failed: ${err.message}`
          );
        } else {
          parentPort.postMessage(
            JSON.stringify({ status: true, catalog: catalog })
          );
        }
      });
      return;
    }

    if (requestAmount < MAX_REQUEST_SENT && urlQueue.waiting.length > 0) {
      requestAmount++;
      let nextUrl = urlQueue.waiting.shift();
      requestModule
        .send(nextUrl.url)
        .then(res => {
          requestAmount--;
          // console.log(
          //   `=> [M${process.pid} - ${require("moment")().format("L LTS")}] ${
          //     res.request.uri.href
          //   } - ${res.statusCode}`
          // );
          handleSuccessRequest(res);
          urlQueue.success.push(nextUrl);
        })
        .catch(err => {
          requestAmount--;
          if (nextUrl.retries < MAX_REQUEST_RETRIES) {
            nextUrl.retries++;
            urlQueue.waiting.push(nextUrl);
            return;
          }
          if (nextUrl.retries >= MAX_REQUEST_RETRIES) {
            urlQueue.failed.push(nextUrl);
          }
        });
    }
  }, 0);
}

/**
 * Save detail URL loop
 */
setInterval(() => {
  let saveQueueLength = saveQueue.length;
  let container = [];
  if (SAVE_AMOUNT < MAX_URL_AMOUNT_PER_CRAWL) {
    container =
      saveQueueLength > SAVE_AMOUNT
        ? saveQueue.splice(0, SAVE_AMOUNT)
        : saveQueue.splice(0, saveQueueLength);
  } else {
    container =
      saveQueueLength > MAX_URL_AMOUNT_PER_CRAWL
        ? saveQueue.splice(0, MAX_URL_AMOUNT_PER_CRAWL)
        : saveQueue.splice(0, saveQueueLength);
  }
  if (container.length > 0) {
    DetailUrl.insertMany(container, { ordered: false }, (err, docs) => {
      if (err) {
        console.log(
          `=> [M${process.pid} - ${require("moment")().format(
            "L LTS"
          )}] Crawl detail URL worker > Save failed: ${err.message}`
        );
      } else {
        currentSaveAmount += docs.length;
        // console.log(
        //     `=> [M${process.pid} - ${require("moment")().format(
        //         "L LTS"
        //     )}] Crawl detail URL worker > Queue remaining: ${saveQueue.length}`,"- Current save:",currentSaveAmount
        // );
      }
    });
  }
}, 1000 * REPEAT_TIME.SAVE);

/**
 * Handle when request is success (200)
 * @param res
 */
function handleSuccessRequest(res) {
  let detailUrlCssSelector = catalog.detailUrl;
  let pageNumberCssSelector = catalog.pageNumber;
  let host = catalog.hostId;
  const $ = cheerio.load(res.body);

  // Get detail link
  $("a").each(function() {
    let cssSelector = getCssSelector($, $(this));
    if (
      getSimilarPercentageCssSelector(detailUrlCssSelector, cssSelector) >
      SIMILAR_PERCENT
    ) {
      let detailHref = makeupHref($(this).attr("href"), host.domain);
      if (!existDetailUrls.find(d => d.url === detailHref)) {
        saveQueue.push({
          url: detailHref,
          catalogId: catalog._id
        });
        existDetailUrls.push({
          url: detailHref,
          catalogId: catalog._id
        });
      }
    }
  });

  // Get paging href
  $(pageNumberCssSelector)
    .children("a")
    .each(function() {
      let pagingHref = makeupHref($(this).attr("href"), host.domain);
      // console.log(pagingHref);
      if (
        !urlQueue.waiting.find(e => e.url === pagingHref) &&
        !urlQueue.success.find(e => e.url === pagingHref) &&
        !urlQueue.failed.find(e => e.url === pagingHref)
      ) {
        urlQueue.waiting.push({
          url: pagingHref,
          retries: 0
        });
      }
    });
}

/**
 * Get selector base on CSS Selector syntax
 * @param $
 * @param node
 * @returns {string}
 */
function getCssSelector($, node) {
  let el = node;
  let parents = el.parents();
  if (!parents[0]) {
    // Element doesn't have any parents
    return ":root";
  }
  let selector = getElementSelector(el);
  let i = 0;
  let elementSelector;

  if (selector[0] === "#" || selector === "body") {
    return selector;
  }

  do {
    elementSelector = getElementSelector($(parents[i]));
    selector = elementSelector + ">" + selector;
    i++;
  } while (i < parents.length - 1 && elementSelector[0] !== "#"); // Stop before we reach the html element parent
  return selector;
}

/**
 * Support of getCssSelector function, return CSS selector of this element
 * @param el
 * @returns {string}
 */
function getElementSelector(el) {
  if (el.attr("id")) {
    return "#" + el.attr("id");
  } else {
    let tagName = el.get(0).tagName.toLowerCase();
    if (tagName === "body") {
      return tagName;
    }
    if (el.attr("class")) {
      let className = `.${el
        .attr("class")
        .trim()
        .replace(/\s+/g, ".")}`;
      let classSiblings = el.siblings(className);
      if (classSiblings.length <= 0) {
        return `${el.get(0).tagName.toLowerCase()}${className}`;
      } else {
        return `${el.get(0).tagName.toLowerCase()}:nth-child(${el.index() +
          1})`;
      }
    }
    if (el.siblings().length === 0) {
      return el.get(0).tagName.toLowerCase();
    }
    if (el.index() === 0) {
      return `${el.get(0).tagName.toLowerCase()}:first-child`;
    }
    if (el.index() === el.siblings().length) {
      return `${el.get(0).tagName.toLowerCase()}:last-child`;
    }
    return `${el.get(0).tagName.toLowerCase()}:nth-child(${el.index() + 1})`;
  }
}

/**
 * Get similar percentage CSS selector (compare with each element of array which was splat base on '>')
 * @param firstCssSelector
 * @param secondCssSelector
 * @returns {number}
 */
function getSimilarPercentageCssSelector(firstCssSelector, secondCssSelector) {
  firstCssSelector = firstCssSelector.trim().split(">");
  secondCssSelector = secondCssSelector.trim().split(">");

  if (firstCssSelector.length !== secondCssSelector.length) {
    return 0;
  }

  let maxLength =
    firstCssSelector.length > secondCssSelector.length
      ? firstCssSelector.length
      : secondCssSelector.length;
  let similarCount = 0;
  for (let i = 0; i < firstCssSelector.length; i++) {
    if (firstCssSelector[i] === secondCssSelector[i]) {
      similarCount++;
    }
  }

  return parseFloat(((similarCount * 100) / maxLength).toFixed(2));
}

/**
 * Get full URL (domain + path)
 * @param href
 * @param domain
 * @returns {*|jQuery|string}
 */
function makeupHref(href, domain) {
  if (/^\//g.test(href.trim())) {
    href = domain + href;
  }
  return href.trim();
}
