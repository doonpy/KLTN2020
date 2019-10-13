/* eslint-disable no-array-constructor */
const fs = require('fs');
const path = require('path');
const PATH_FOLDER = '../../../raw-html';

// eslint-disable-next-line require-jsdoc
function isFolderExist(pathFolder) {
  try {
    fs.accessSync(pathFolder);
    return true;
  } catch (err) {
    return false;
  }
}

exports.getHtmlFile = (domain, amount) => {
  const pathFolder = path.join(__dirname, `${PATH_FOLDER}/${domain}`);
  if (!isFolderExist(pathFolder)) {
    return {message: 'Folder not found', status: 'Failed'};
  }
  const files = fs.readdirSync(pathFolder);
  const result = new Array();
  for (let i = 0; i < amount; i++) {
    const fileContent = fs.readFileSync(path.join(pathFolder, files[i]), {
      encoding: 'utf-8',
    });

    result.push({
      filename: files[i],
      content: fileContent,
    });
  }

  result.status = `Success`;
  return result;
};
