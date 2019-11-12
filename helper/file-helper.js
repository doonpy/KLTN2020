const fs = require("fs");
const STORAGE_PATH = process.env.STORAGE_PATH;
const READ_FILE_OPTION_ENCODING = "utf-8";
const uuidv3 = require("uuid/v3");
const NAMESPACE_FILE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

/**
 *
 * @param folderPath
 * @returns {Promise<boolean>}
 */
const isFolderExist = folderPath => {
  return new Promise((resolve, reject) => {
    fs.access(folderPath, err => {
      if (err && err.code === "ENOENT") {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const getAllFileInFolder = folderPath => {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
};

const getFileContent = (folderPath, fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      `${folderPath}/${fileName}`,
      { encoding: READ_FILE_OPTION_ENCODING },
      (err, content) => {
        if (err) reject(err);
        resolve(content);
      }
    );
  });
};

const createFolder = folderPath => {
  return new Promise((resolve, reject) => {
    fs.mkdir(folderPath, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const createFile = (folderPath, fileName, content, encryption = false) => {
  return new Promise((resolve, reject) => {
    isFolderExist(folderPath).then(async result => {
      if (!result) {
        await createFolder(folderPath);
      }
      let extension = fileName.split(".").pop();
      if (encryption) {
        fileName = uuidv3(fileName, NAMESPACE_FILE);
      }
      fs.writeFile(
        `${folderPath}/${fileName}.${extension}`,
        content,
        { encoding: "utf-8" },
        err => {
          if (err) {
            reject(err);
          } else {
            resolve(`${fileName}.${extension}`);
          }
        }
      );
    });
  });
};

module.exports = {
  isFolderExist: isFolderExist,
  getAllFileInFolder: getAllFileInFolder,
  getFileContent: getFileContent,
  createFolder: createFolder,
  createFile: createFile
};
