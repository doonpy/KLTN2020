const FOLDER_STORAGE = `./raw-html`;
const FOLDER_LOG = `./logs`;
const fs = require("fs");

(() => {
  fs.access(FOLDER_STORAGE, err => {
    if (err && err.code === "ENOENT") fs.mkdirSync(FOLDER_STORAGE);
  });
})();

module.exports.getMainDomainFromUrl = url => {
  let pattern = new RegExp(
    /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim
  );
  return url
    .match(pattern)
    .toString()
    .replace(/(http|https):\/\//, "");
};

module.exports.createStorageFolder = folderName => {
  return new Promise((resolve, reject) => {
    fs.mkdir(`${FOLDER_STORAGE}/${folderName}`, err => {
      err && err.code !== "EEXIST" ? reject(err) : resolve();
    });
  });
};

module.exports.createRawHtmlFile = (folderName, fileName, content) => {
  fs.writeFileSync(
    `${FOLDER_STORAGE}/${folderName}/${fileName.replace(/\//g)}.html`,
    content
  );
};

module.exports.exportLog = queueUrl => {
  console.log("Exporting log file...");
  let nowDate = new Date();
  queueUrl.time = nowDate;
  fs.writeFileSync(
    `${FOLDER_LOG}/log_${this.getMainDomainFromUrl(
      queueUrl.mainUrl
    )}_${nowDate.getDay()}${nowDate.getMonth()}${nowDate.getFullYear()}_${nowDate.getHours()}${nowDate.getMinutes()}${nowDate.getSeconds()}.json`,
    JSON.stringify(queueUrl)
  );
};
