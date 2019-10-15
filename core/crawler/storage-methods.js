/* eslint-disable no-array-constructor */
/* eslint-disable no-invalid-this */
/* eslint-disable require-jsdoc */

const fs = require('fs');

exports.getMainDomainFromUrl = function getMainDomainFromUrl(url) {
  const pattern = new RegExp(
      /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim
  );
  return url
      .match(pattern)
      .toString()
      .replace(/(http|https):\/\//, '');
};

exports.createStorageFolder = function createStorageFolder(url) {
  return new Promise((resolve, reject) => {
    const domain = this.getMainDomainFromUrl(url);
    fs.mkdir(`${process.env.RAW_HTML_STORAGE_PATH}/${domain}`, (err) => {
      err && err.code !== 'EEXIST' ? reject(err) : resolve();
    });
  });
};

exports.createRawHtmlFile = function createRawHtmlFile(
    folderName,
    fileName,
    content
) {
  fs.writeFileSync(
      `${process.env.RAW_HTML_STORAGE_PATH}/${folderName}/${fileName.replace(
          /\//g
      )}.html`,
      content
  );
};

exports.getRawHtmlFile = function getRawHtmlFile(folderName, fileName) {
  try {
    return fs.readFileSync(
        `${process.env.RAW_HTML_STORAGE_PATH}/${folderName}/${fileName}.html`,
        {
          encoding: 'utf-8',
        }
    );
  } catch (err) {
    if (err.code === 'ENOENT') {
      return 'ENOENT';
    } else {
      throw err;
    }
  }
};

exports.exportLog = function exportLog(queueUrl) {
  const nowDate = new Date();
  queueUrl.lastUpdate = nowDate;
  fs.writeFileSync(
      `${process.env.LOG_STORAGE_PATH}/log_${this.getMainDomainFromUrl(
          queueUrl.mainUrl
      )}.json`,
      JSON.stringify(queueUrl)
  );
};

exports.createLog = function createLog(url) {
  const domain = this.getMainDomainFromUrl(url);
  try {
    return JSON.parse(
        fs.readFileSync(`${process.env.LOG_STORAGE_PATH}/log_${domain}.json`, {
          encoding: 'utf-8',
        })
    );
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {
        mainUrl: url,
        // eslint-disable-next-line no-array-constructor
        handled: new Array(),
        waiting: new Array(),
        failed: new Array(),
      };
    } else {
      throw err;
    }
  }
};
