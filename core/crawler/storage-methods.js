/* eslint-disable no-array-constructor */
/* eslint-disable no-invalid-this */
/* eslint-disable require-jsdoc */
const FOLDER_STORAGE = `./raw-html`;
const FOLDER_LOG = `./logs`;
const fs = require('fs');

module.exports.getMainDomainFromUrl = function getMainDomainFromUrl(url) {
  const pattern = new RegExp(
      /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim
  );
  return url
      .match(pattern)
      .toString()
      .replace(/(http|https):\/\//, '');
};

module.exports.createStorageFolder = function createStorageFolder(url) {
  return new Promise((resolve, reject) => {
    const domain = this.getMainDomainFromUrl(url);
    fs.mkdir(`${FOLDER_STORAGE}/${domain}`, (err) => {
      err && err.code !== 'EEXIST' ? reject(err) : resolve();
    });
  });
};

module.exports.createRawHtmlFile = function createRawHtmlFile(
    folderName,
    fileName,
    content
) {
  fs.writeFileSync(
      `${FOLDER_STORAGE}/${folderName}/${fileName.replace(/\//g)}.html`,
      content
  );
};

module.exports.getRawHtmlFile = function getRawHtmlFile(folderName, fileName) {
  try {
    return fs.readFileSync(`${FOLDER_STORAGE}/${folderName}/${fileName}.html`, {
      encoding: 'utf-8',
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return 'ENOENT';
    } else {
      throw err;
    }
  }
};

module.exports.exportLog = function exportLog(queueUrl) {
  const nowDate = new Date();
  queueUrl.lastUpdate = nowDate;
  fs.writeFileSync(
      `${FOLDER_LOG}/log_${this.getMainDomainFromUrl(queueUrl.mainUrl)}.json`,
      JSON.stringify(queueUrl)
  );
};

module.exports.createLog = function createLog(url) {
  const domain = this.getMainDomainFromUrl(url);
  try {
    return JSON.parse(
        fs.readFileSync(`${FOLDER_LOG}/log_${domain}.json`, {
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
