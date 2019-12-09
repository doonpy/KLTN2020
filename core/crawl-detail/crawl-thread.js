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
    let cssSelector = getCssSelector($(this));
    console.log(cssSelector)
    if (
      getSimilarPercentageCssSelector(detailUrlCssSelector, cssSelector) >
      SIMILAR_PERCENT
    ) {
      let detailHref = makeupHref($(this).attr("href"),host.domain)
      console.log(detailHref);
    }
  });

  // Get paging href
  $(pageNumberCssSelector).children('a').each(function(){
    let pagingHref = makeupHref($(this).attr("href"),host.domain)
    console.log(pagingHref);
  })
}

function getCssSelector(node) {

  if (this.length != 1) {
    return ""
  };

  let path = "";
  while (node.length) {
    let realNode = node[0];
    let name = (

        // IE9 and non-IE
        realNode.localName ||

        // IE <= 8
        realNode.tagName ||
        realNode.nodeName

    );

    // on IE8, nodeName is '#document' at the top level, but we don't need that
    if (!name || name == '#document') break;

    name = name.toLowerCase();
    if (realNode.id) {
      // As soon as an id is found, there's no need to specify more.
      return name + '#' + realNode.id + (path ? '>' + path : '');
    } else if (realNode.className) {
      name += '.' + realNode.className.split(/\s+/).join('.');
    }

    let parent = node.parent(), siblings = parent.children(name);
    if (siblings.length > 1) name += ':eq(' + siblings.index(node) + ')';
    path = name + (path ? '>' + path : '');

    node = parent;
  }

  return path;
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

function makeupHref(href,domain){
  if(/^\//g.test(href.trim())){
    href=domain+href;
  }
  return href.trim();
}