const fs = require("fs");
const path = require("path");
const READ_FILE_OPTION_ENCODING = "utf-8";
const uuidv3 = require("uuid/v3");
const NAMESPACE_FILE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

/**
 * Init folder temp
 */
const initTempFolder = () => {
    fs.access(process.env.STORAGE_PATH, err => {
        if (err) {
            if (err.code === "ENOENT") {
                fs.mkdirSync(process.env.STORAGE_PATH);
            }
        } else {
            let pathList = fs.readdirSync(process.env.STORAGE_PATH);
            pathList.forEach(path => {
                let pathJoined = `${process.env.STORAGE_PATH}/${path}`;
                if (fs.statSync(pathJoined).isFile()) {
                    fs.unlinkSync(pathJoined);
                } else {
                    deleteAll(pathJoined).catch(err => {
                        throw err;
                    });
                }
            });
        }
    });
};

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

/**
 *
 * @param folderPath
 * @returns {Promise<[string]>}
 */
const getAllFileInFolder = folderPath => {
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
            if (err) reject(err);
            resolve(files);
        });
    });
};

/**
 *
 * @param folderPath
 * @param fileName
 * @returns {Promise<string>}
 */
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

/**
 *
 * @param folderPath
 * @returns {Promise<null|Error>}
 */
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

/**
 *
 * @param folderPath
 * @param fileName
 * @param content
 * @param encryption
 * @returns {Promise<string|Error>}
 */
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

/**
 * Delete all file(s) in folder
 * @param folderPath
 * @returns {Promise<null|Error>}
 */
const deleteAll = folderPath => {
    return new Promise((resolve, reject) => {
        let files = fs.readdirSync(folderPath);
        files.forEach(file => {
            fs.unlink(`${folderPath}/${file}`, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
};

module.exports = {
    initTempFolder: initTempFolder,
  isFolderExist: isFolderExist,
  getAllFileInFolder: getAllFileInFolder,
  getFileContent: getFileContent,
  createFolder: createFolder,
    createFile: createFile,
    deleteAll: deleteAll
};
