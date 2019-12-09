const DetailUrl = require("../../models/detail-url-model");
const requestModule = require("../module/request");
const { workerData, parentPort } = require("worker_threads");
const cheerio = require("cheerio");

const SIMILAR_PERCENT = 80;
const MAX_REQUEST_SENT = 10;
const MAX_REQUEST_RETRIES = 3;
const catalog = JSON.parse(workerData);
let urlQueue = {
  success: [],
  waiting: [],
  failed: []
};

main(catalog);

function main() {
  let catalogHref = catalog.href;
  let requestAmount = 0;

  urlQueue.waiting.push({
    url: catalogHref,
    retries: 0
  });

  const loop = setInterval(() => {
    if (urlQueue.waiting.length === 0 && requestAmount === 0) {
      clearInterval(loop);
      return;
    }

    if (requestAmount < MAX_REQUEST_SENT && urlQueue.waiting.length > 0) {
      requestAmount++;
      let nextUrl = urlQueue.waiting.shift();
      requestModule
        .send(nextUrl.url)
        .then(res => {
          requestAmount--;
          console.log(res.request.uri.href, res.statusCode);
          handleSuccessRequest(res);
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

function handleSuccessRequest(res) {
  let detailUrlCssSelector = catalog.detailUrl;
  let pageNumberCssSelector = catalog.pageNumber;
  let host = catalog.hostId;
  const $ = cheerio.load(res.body);

  // Get detail link
  $("a").each(function() {
    let cssSelector = getCssSelector($, $(this));
    console.log(cssSelector);
    //TODO: Fix bug can't get css selector of paging element
    // if (
    //   getSimilarPercentageCssSelector(detailUrlCssSelector, cssSelector) >
    //   SIMILAR_PERCENT
    // ) {
    //   let detailHref = makeupHref($(this).attr("href"), host.domain);
    //   // console.log(detailHref);
    // }
  });

  // Get paging href
  // console.log(pageNumberCssSelector);
  // $(pageNumberCssSelector)
  //   .children("a")
  //   .each(function() {
  //     let pagingHref = makeupHref($(this).attr("href"), host.domain);
  //     console.log(pagingHref);
  //     if (
  //       !urlQueue.waiting.find(e => e.url === pagingHref) &&
  //       !urlQueue.success.find(e => e.url === pagingHref) &&
  //       !urlQueue.failed.find(e => e.url === pagingHref)
  //     ) {
  //       urlQueue.waiting.push({
  //         url: pagingHref,
  //         retries: 0
  //       });
  //     }
  //   });
}

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

function makeupHref(href, domain) {
  if (/^\//g.test(href.trim())) {
    href = domain + href;
  }
  return href.trim();
}

function getElementSelector(el) {
  if (el.attr("id")) {
    return "#" + el.attr("id");
  } else {
    let tagName = el.get(0).tagName.toLowerCase();
    if (tagName === "body") {
      return tagName;
    }
    if (el.attr("class")) {
      let classSiblings = el.siblings(
          `.${el
              .attr("class")
              .split(/\s+/g)
              .join(".")}`
      );
      if (classSiblings.length <= 0) {
        return `${el.get(0).tagName.toLowerCase()}.${el
            .attr("class")
            .split(/\s+/g)
            .join(".")}`;
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
