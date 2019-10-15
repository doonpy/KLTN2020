/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
const fs = require('fs');
const TEMP_STORAGE_PATH = 'temp';
const RAW_HTML_STORAGE_PATH = 'temp/raw-htmls';
const LOG_STORAGE_PATH = 'temp/logs';

process.env.TEMP_STORAGE_PATH = TEMP_STORAGE_PATH;
process.env.RAW_HTML_STORAGE_PATH = RAW_HTML_STORAGE_PATH;
process.env.LOG_STORAGE_PATH = LOG_STORAGE_PATH;

const isFolderExist = (folderName) => {
  return new Promise((resolve) => {
    fs.open(folderName, (err) => {
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

exports.init = async () => {
  // temp folder
  await isFolderExist(TEMP_STORAGE_PATH).then((result) => {
    if (!result) {
      {
        createFolder(TEMP_STORAGE_PATH)
            .then(() => {
              console.log(`=> Create folder ${TEMP_STORAGE_PATH}`);
            })
            .catch((err) => {
              console.log(`=> ERR: ${err}`);
            });
      }
    }
  });

  // raw-html folder
  await isFolderExist(RAW_HTML_STORAGE_PATH).then((result) => {
    if (!result) {
      {
        createFolder(RAW_HTML_STORAGE_PATH)
            .then(() => {
              console.log(`=> Create folder ${RAW_HTML_STORAGE_PATH}`);
            })
            .catch((err) => {
              console.log(`=> ERR: ${err}`);
            });
      }
    }
  });

  // logs folder
  await isFolderExist(LOG_STORAGE_PATH).then((result) => {
    if (!result) {
      {
        createFolder(LOG_STORAGE_PATH)
            .then(() => {
              console.log(`=> Create folder ${LOG_STORAGE_PATH}`);
            })
            .catch((err) => {
              console.log(`=> ERR: ${err}`);
            });
      }
    }
  });
};
