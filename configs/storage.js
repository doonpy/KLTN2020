/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
const fs = require('fs');
const TEMP_STORAGE_PATH = '../temp';
const RAW_HTML_STORAGE_PATH = '../temp/raw-htmls';
const LOG_STORAGE_PATH = '../temp/logs';

console.log(__dirname);

process.env.TEMP_STORAGE_PATH = TEMP_STORAGE_PATH;
process.env.RAW_HTML_STORAGE_PATH = RAW_HTML_STORAGE_PATH;
process.env.LOG_STORAGE_PATH = LOG_STORAGE_PATH;

const isFolderExist = (folderName) => {
  return new Promise((resolve) => {
    fs.access(folderName, (err) => {
      if (err && err.code === 'ENOENT') resolve(false);
      else resolve(true);
    });
  });
};

const createFolder = (folderName) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(folderName, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

exports.init = () => {
  // temp folder
  isFolderExist(TEMP_STORAGE_PATH).then((result) => {
    console.log(result);
    if (!result) {
      {
        createFolder(TEMP_STORAGE_PATH)
            .then(() => {
              console.log('created');
            })
            .catch((err) => {
              console.log(err);
            });
      }
      console.log('yes');
    }
  });
};
