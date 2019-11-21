const DefData = require("../models/definition-model");
const RawData = require("../models/raw-data-model");
const DetailUrl = require("../models/detail-url-model");
const cheerio = require("cheerio");
const childProcess = require("child_process");
const path = require("path");
const MODUlE_PATH = path.join(__dirname, `./request`);
const NODE_TYPE_TEXT = 3;
const numCPUs = require("os").cpus().length;
const ErrorCode = require("../helper/error-code");

var numChildProcess = 0;

function getContentByXPath(body, xpath) {
    const $ = cheerio.load(body);
    let xpathArray = xpath.split("/");
    let selector = $("*");
    let tagName = "";
    let index = 0;

    xpathArray.splice(0, 2); //remove null and html element

    while (xpathArray.length > 0) {
        let firstElement = xpathArray.shift();

        tagName = firstElement.match(/[a-z]+([1-6])?/g)[0];
        index = firstElement.match(/\[[0-9]+\]/g)
            ? firstElement.match(/\[[0-9]+\]/g)[0].replace(/\[+|\]+/g, "") - 1
            : 0;

        selector = $(selector)
            .children(tagName)
            .get(index);
    }

    let textData = "";
    $(selector)
        .contents()
        .each(function () {
            if (this.nodeType === NODE_TYPE_TEXT) {
                let text = $(this)
                    .text()
                    .trim()
                    .replace(/\n\r/g, "");
                if (text !== "" || text !== null) textData += text;
            }
        });

    return textData;
}

function forkProcess(url, definition) {
    return new Promise((resolve, reject) => {
        const forked = childProcess.fork(MODUlE_PATH);
        console.log(`=> Fork child process ${forked.pid} for extract "${url}"`);
        numChildProcess++;

        //set message to child process, request start crawl
        forked.send({url: url});

        //listen result from child process
        forked.on("message", data => {
            // failed
            if (data.err) {
                reject({url: url, err: data.err});
            } else {
                extractData(data.response.body, url, definition)
                    .then(() => {
                        resolve(url);
                    })
                    .catch(err => {
                        reject({url: url, err: err});
                    });
            }

            // kill child process
            forked.kill("SIGTERM");
            console.log(
                `=> Kill child process ${forked.pid} - status: ${forked.killed}`
            );
            numChildProcess--;
        });
    });
}

function extractData(body, url, definition) {
    return new Promise((resolve, reject) => {
        let title = [];
        let price = [];
        let acreage = [];
        let address = [];
        let otherData = [];

        //title
        definition.titlexPath.forEach(xpath => {
            title.push(getContentByXPath(body, xpath));
        });

        //price
        definition.pricexPath.forEach(xpath => {
            price.push(getContentByXPath(body, xpath));
        });

        //acreage
        definition.acreagexPath.forEach(xpath => {
            acreage.push(getContentByXPath(body, xpath));
        });

        //address
        definition.addressxPath.forEach(xpath => {
            address.push(getContentByXPath(body, xpath));
        });

        //other
        definition.other.forEach(e => {
            let data = [];
            e.xPath.forEach(xpath => {
                data.push(getContentByXPath(body, xpath));
            });
            otherData.push({
                name: e.name,
                data: data
            });
        });

        let rawData = new RawData({
            url: url,
            title: title,
            price: price,
            acreage: acreage,
            address: address,
            other: otherData
        });

        rawData.save(err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

exports.main = (hostname, catalogId, socket) => {
    DefData.findOne({hostname: hostname}, (err, def) => {
        if (err) {
            socket.emit(
                "process-message",
                `${ErrorCode.DATABASE.DB_ERROR_1} ${err.errorCode}`
            );
        }
        if (!def) {
            socket.emit("process-message", ErrorCode.EXTRACT.EXTRACT_ERROR_2);
            return;
        }

        let definition = def.getDefinitionByCatalogId(catalogId);
        if (!definition) {
            socket.emit("process-message", ErrorCode.EXTRACT.EXTRACT_ERROR_2);
            return;
        }

        DetailUrl.findOne({hostname: hostname}, (err, data) => {
            if (err) {
                socket.emit(
                    "process-message",
                    `${ErrorCode.DATABASE.DB_ERROR_1} ${err.errorCode}`
                );
            }
            let catalog = data.getCatalogListById(catalogId);
            if (!catalog) {
                socket.emit("process-message", ErrorCode.EXTRACT.EXTRACT_ERROR_3);
            }

            catalog.urlList.filter(u => {
                return u.isExtracted === true;
            });

            let queue = catalog.urlList.map(u => {
                return u.url;
            });
            console.log(queue);
            const loop = setInterval(() => {
                if (queue.length === 0) {
                    clearInterval(loop);
                    console.log("done");
                }
                if (numChildProcess < numCPUs) {
                    forkProcess(queue.shift(), definition)
                        .then(url => {
                            socket.emit("process-message", `Extract "${url}" - OK`);
                        })
                        .catch(data => {
                            socket.emit(
                                "process-message",
                                `Extract "${data.url} - ERROR:${err.errorCode}`
                            );
                        });
                }
            }, 0);
        });
    });
};
