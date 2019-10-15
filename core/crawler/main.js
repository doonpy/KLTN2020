/* eslint-disable no-unused-vars */
const request = require('request');
const cherrio = require('cheerio');
const storageMethod = require('./storage-methods');
const DEFAULT_OPTION = {
  MAX_REQUEST_PER_CRAWL: 20,
  MAX_TIMEOUT: 1000 * 15,
  DEEPLIMIT: Number.MAX_SAFE_INTEGER, // 1 is unlimited
};

const sendRequest = (url) => {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'Googlebot/2.1 (+http://www.googlebot.com/bot.html)',
    };
    request(
        url,
        {time: true, timeout: DEFAULT_OPTION.MAX_TIMEOUT, headers: headers},
        function(error, response) {
          if (error) reject(error);
          else resolve(response);
        }
    );
  });
};

const isHandled = (queueUrl, url) => {
  const urlHandled = queueUrl.handled.find((e) => e.url === url);
  if (urlHandled === undefined) return false;
  return true;
};

const enqeueLinks = ($, response, queueUrl) => {
  const pattern = new RegExp(`^${queueUrl.mainUrl}(\/){1}(.*)$`);

  // enqeue pseudo Url
  const elementList = $('a').toArray();
  const uri = response.request.uri;

  elementList.forEach((e) => {
    if (
      $(e).attr('href') !== undefined &&
      !$(e)
          .attr('href')
          .match(/^\/\//g)
    ) {
      const url = `${uri.protocol}//${uri.hostname}${$(e)
          .attr('href')
          .replace(`${uri.protocol}//${uri.hostname}`, '')}`;
      const deepRange = url.split('/').length - 2; // not include // of 'https://'
      const deepStandard = queueUrl.mainUrl.split('/').length - 3;
      // console.log(pattern.test(url), url);
      if (
        pattern.test(url) &&
        !isHandled(queueUrl, url) &&
        queueUrl.waiting.find((e) => e === url) === undefined &&
        deepRange - deepStandard <= DEFAULT_OPTION.DEEPLIMIT
      ) {
        queueUrl.waiting.push(url);
      }
    }
  });
};

const markHandledUrl = (queueUrl, response) => {
  queueUrl.handled.push({
    url: response.request.uri.href,
    elapsedTime: response.elapsedTime,
    statusCode: response.statusCode,
  });
  queueUrl.waiting.shift();
};

const markFailedUrl = (queueUrl, error) => {
  queueUrl.failed.push({
    url: queueUrl.waiting[0],
    errNo: error.errno,
    errCode: error.code,
  });
  queueUrl.waiting.shift();
};

const handleRequestSuccessed = (response, queueUrl) => {
  console.log(
      `-> Request to ${response && response.request.uri.href}`,
      `-`,
      response && response.statusCode,
      `-`,
      `${response.elapsedTime}ms`
  );

  markHandledUrl(queueUrl, response);

  const $ = cherrio.load(response.body);
  const title = $('title')
      .text()
      .trim();
  storageMethod.createRawHtmlFile(
      storageMethod.getMainDomainFromUrl(queueUrl.mainUrl),
      title,
      response.body
  );

  enqeueLinks($, response, queueUrl);
};

const handleRequestFailed = (queueUrl, error) => {
  console.log(
      `-> Request to ${queueUrl.waiting[0]}`,
      `-`,
      `ERROR: ${error.code || error}`
  );

  markFailedUrl(queueUrl, error);
};

const crawler = async (queueUrl) => {
  console.log(`=> Start crawl ${queueUrl.mainUrl}`);
  const startTime = new Date();
  let requestCount = 0;
  while (
    queueUrl.waiting.length > 0 &&
    requestCount <= DEFAULT_OPTION.MAX_REQUEST_PER_CRAWL
  ) {
    if (!isHandled(queueUrl, queueUrl.waiting[0])) {
      await sendRequest(queueUrl.waiting[0])
          .then((response) => {
            handleRequestSuccessed(response, queueUrl);
          })
          .catch((err) => {
            handleRequestFailed(queueUrl, err);
          });
      requestCount++;
    } else {
      queueUrl.waiting.shift();
    }
  }
  queueUrl.executeTime += new Date() - startTime;
  console.log('=> Exporting log file...');
  storageMethod.exportLog(queueUrl);

  console.log('=> Done!');
  process.send({type: true, err: null});
};

const validateUrl = (url) => {
  const pattern = new RegExp(
      // eslint-disable-next-line max-len
      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
  );

  return pattern.test(url);
};

const sanitizeUrl = (url) => {
  const pattern = new RegExp(/\/+$/g);
  return url.replace(pattern, '');
};

const main = (url, option) => {
  if (!validateUrl(url)) {
    // eslint-disable-next-line no-throw-literal
    throw 'Invalid URL!';
  }
  url = sanitizeUrl(url);

  // setting option
  if (option !== undefined) {
    DEFAULT_OPTION.DEEPLIMIT = option.deepLimit || DEFAULT_OPTION.DEEPLIMIT;
    DEFAULT_OPTION.MAX_REQUEST_PER_CRAWL =
      option.maxRequestPerCrawl || DEFAULT_OPTION.MAX_REQUEST_PER_CRAWL;
    DEFAULT_OPTION.MAX_TIMEOUT =
      option.maxTimeout || DEFAULT_OPTION.MAX_TIMEOUT;
  }

  const queueUrl = storageMethod.createLog(url);

  storageMethod
      .createStorageFolder(url)
      .then(() => {
        queueUrl.waiting.push(url);
        crawler(queueUrl);
      })
      .catch((err) => {
        throw err;
      });
};

process.on('message', (data) => {
  try {
    main(data.url);
  } catch (err) {
    console.log(err);
    process.send({type: false, err: err});
  }
});
