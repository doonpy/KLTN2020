const Definition = require("../../models/definition-model");
const RawData = require("../../models/raw-data-model");
const DetailUrl = require("../../models/detail-url-model");
const cheerio = require("cheerio");
const async = require("async");
const requestModule = require("../module/request");
const saveModule = require("../module/save");
const NODE_TYPE_TEXT = 3;
const MAX_REQUEST_SENT = 10;
const ErrorCode = require("../../helper/error-code");
const {parentPort} = require("worker_threads");
require("../../configs/database-config").init();

let requestCount = 0;
let isPause = false;

//
(function () {
})();

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

function extractData(body, definition) {
    let title = [];
    let price = [];
    let acreage = [];
    let address = [];
    let othersData = [];

    //title
    definition.title.forEach(xpath => {
        title.push(getContentByXPath(body, xpath));
    });

    //price
    definition.price.forEach(xpath => {
        price.push(getContentByXPath(body, xpath));
    });

    //acreage
    definition.acreage.forEach(xpath => {
        acreage.push(getContentByXPath(body, xpath));
    });

    //address
    definition.address.forEach(xpath => {
        address.push(getContentByXPath(body, xpath));
    });

    //other
    definition.others.forEach(e => {
        let data = [];
        e.xpath.forEach(xpath => {
            data.push(getContentByXPath(body, xpath));
        });
        othersData.push({
            name: e.name,
            data: data
        });
    });

    return {
        title: title,
        price: price,
        acreage: acreage,
        address: address,
        others: othersData
    };
}

function main(catalogId) {
    console.log(global.test)
    async.parallel(
        {
            detailUrls: function (callback) {
                DetailUrl.find({catalogId: catalogId, isExtracted: false}).exec(
                    callback
                );
            },
            definition: function (callback) {
                Definition.findOne({catalogId: catalogId}).exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                sendError(new Error(ErrorCode.DATABASE.DB_ERROR_1));
                return;
            }

            let definition = results.definition;
            let detailUrls = results.detailUrls;
            if (detailUrls.length > 0) {
                let loop = setInterval(() => {
                    if (detailUrls.length === 0) {
                        clearInterval(loop);
                        sendMessage({type: "finish"});
                        return;
                    }

                    if (!isPause && requestCount < MAX_REQUEST_SENT) {
                        requestCount++;
                        let detailUrl = detailUrls.shift();
                        requestModule
                            .send(detailUrl.url)
                            .then(res => {
                                requestCount--;
                                let data = extractData(res.body, definition);
                                data.detailUrlId = detailUrl._id;

                                let rawData = new RawData(data);
                                detailUrl.isExtracted = true;
                                // saveModule.queue.push(rawData);
                                // saveModule.queue.push(detailUrl);

                                sendMessage({
                                    type: "success",
                                    data: {
                                        url: res.request.uri.href,
                                        statusCode: res.statusCode
                                    }
                                });
                            })
                            .catch(err => {
                                sendError(err);
                            });
                    }
                });
            }
        }
    );
}

// send message to parent
function sendMessage(message) {
    parentPort.postMessage(message);
}

// send error to parent
function sendError(err) {
    parentPort.postMessage({type: "error", data: err});
}

// listen message from parent
parentPort.on("message", message => {
    let messageData = message.data;
    let messageType = message.type;
    switch (messageType) {
        case "start":
            main(messageData.catalogId);
            break;
        case "pause":
            isPause = true;
            sendMessage({type: "info", data: `Pause extract data success...`});
            break;
        case "continue":
            isPause = false;
            sendMessage({type: "info", data: `Continue extract data success...`});
            break;
        default:
            sendError(new Error("Message type is invalid."));
    }
});
