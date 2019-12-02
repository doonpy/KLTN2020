const fs = require("fs");

exports.createFolder = foldername => {
    return new Promise((resolve, reject) => {
        fs.access(`${process.env.STORAGE_PATH}/${foldername}`, err => {
            if (err && err.code === "ENOENT") {
                fs.mkdir(`${process.env.STORAGE_PATH}/${foldername}`, err => {
                    if (err) reject(err);
                    resolve();
                });
            } else resolve();
        });
    });
};

exports.createFile = (foldername, filename, content) => {
    this.createFolder(foldername)
        .then(() => {
            fs.writeFileSync(
                `${process.env.STORAGE_PATH}/${foldername}/${filename}`,
                content
            );
        })
        .catch(err => {
            throw err;
        });
};
