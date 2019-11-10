const fs = require("fs");
const STORAGE_PATH = process.env.STORAGE_PATH;
const READ_FILE_OPTION_ENCODING = "utf-8";

/**
 *
 * @param folderPath
 * @returns {Promise<boolean>}
 */
exports.isFolderExist = folderPath => {
    return new Promise((resolve, reject) => {
        fs.access(`${STORAGE_PATH}/${folderPath}`, err => {
            if (err && err.code === "ENOENT") {
                resolve(false);
            }
            resolve(true);
        });
    });
};

exports.getAllFileInFolder = folderPath => {
    return new Promise((resolve, reject) => {
        fs.readdir(`${STORAGE_PATH}/${folderPath}`, (err, files) => {
            if (err) reject(err);
            resolve(files);
        });
    });
};

exports.getFileContent = (folderPath, fileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile(
            `${STORAGE_PATH}/${folderPath}/${fileName}`,
            {encoding: READ_FILE_OPTION_ENCODING},
            (err, content) => {
                if (err) reject(err);
                resolve(content);
            }
        );
    });
};
