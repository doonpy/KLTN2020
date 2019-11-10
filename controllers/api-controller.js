const fs = require("fs");
const crawlHandle = require("./crawl-handle");

exports.getHtmls = (req, res, next) => {
    let filename = req.params.filename;
    let hostname = req.params.hostname;
    let html = fs.readFileSync(
        `${process.env.STORAGE_PATH}/${hostname}/${filename}`,
        {
            encoding: "utf-8"
        }
    );
    res.send(html);
};

exports.postDefinition = (req, res, next) => {
    let url = req.body.url;
    let host = req.body.host;
    let data = JSON.parse(req.body.dataString);

    crawlHandle.saveDefinition(host, url, data);

    res.json({
        status: "success"
    });
};
