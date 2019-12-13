require("../../configs/database-config").init();
const DetailUrl = require("../../models/detail-url-model");
const RawData = require("../../models/raw-data-model");
const requestModule = require("../module/request");
const {workerData, parentPort} = require("worker_threads");
const cheerio = require("cheerio");

const NODE_TYPE_TEXT = 3;
const SAVE_AMOUNT = 100;
const MAX_REQUEST_SENT = 20;
const REPEAT_TIME = {
    EXTRACT: 60 * 60, //seconds
    SAVE: 10 //seconds
};
let rawDataSaveQueue = [];
let detailUrlUpdateQueue = [];
let urls = [];
let successAmount = 0;
let failedAmount = 0;
let requestCount = 0;

main(JSON.parse(workerData));

function main(detailUrlsGroup) {
    let {definition, detailUrls} = detailUrlsGroup;

    let requestLoop = setInterval(() => {
        if (detailUrls.length === 0) {
            clearInterval(requestLoop);
            return;
        }

        if (requestCount < MAX_REQUEST_SENT) {
            let detailUrl = detailUrls.shift();
            requestCount++;
            requestModule
                .send(detailUrl.url)
                .then(res => {
                    console.log(
                        `=> [M${process.pid} - ${require("moment")().format(
                            "L LTS"
                        )}] Extract "${res.request.uri.href}" - ${
                            res.statusCode
                        } - ${res.elapsedTime / 1000}s`
                    );
                    let dataExtracted = extractData(res.body, definition);
                    detailUrl.isExtracted = true;
                    detailUrl.requestRetries++;
                    dataExtracted.detailUrlId = detailUrl._id;

                    if (!isNullData(dataExtracted)) {
                        rawDataSaveQueue.push(dataExtracted);
                        detailUrlUpdateQueue.push(detailUrl);

                        // log
                        requestCount--;
                        urls.push({id: detailUrl._id, isSuccess: true});
                        successAmount++;
                    } else {
                        detailUrlUpdateQueue.push(detailUrl);
                        // log
                        requestCount--;
                        urls.push({
                            id: detailUrl._id,
                            isSuccess: false,
                            errorCode: new Error("Null data")
                        });
                        failedAmount++;
                    }
                })
                .catch(err => {
                    detailUrl.requestRetries++;
                    detailUrlUpdateQueue.push(detailUrl);

                    // log
                    requestCount--;
                    urls.push({
                        id: detailUrl._id,
                        isSuccess: false,
                        errorCode: err.message
                    });
                    failedAmount++;
                });
        }
    }, 0);
}

/**
 * Loop update database
 */
setInterval(() => {
    let rawDataSaveQueueLength = rawDataSaveQueue.length;
    let detailUrlUpdateQueueLength = detailUrlUpdateQueue.length;
    if (
        rawDataSaveQueueLength === 0 &&
        detailUrlUpdateQueueLength === 0 &&
        requestCount === 0
    ) {
        let message = {
            urls: urls,
            successAmount: successAmount,
            failedAmount: failedAmount
        };
        parentPort.postMessage(JSON.stringify(message));
    }

    if (rawDataSaveQueueLength === 0 && detailUrlUpdateQueueLength === 0) {
        return;
    }

    let rawDataContainer =
        rawDataSaveQueueLength > SAVE_AMOUNT
            ? rawDataSaveQueue.splice(0, SAVE_AMOUNT)
            : rawDataSaveQueue.splice(0, rawDataSaveQueueLength);
    let detailUrlContainer =
        detailUrlUpdateQueueLength > SAVE_AMOUNT
            ? detailUrlUpdateQueue.splice(0, SAVE_AMOUNT)
            : detailUrlUpdateQueue.splice(0, detailUrlUpdateQueueLength);

    RawData.insertMany(rawDataContainer, {ordered: false}, (err, docs) => {
        if (err) {
            console.log(
                `=> [M${process.pid} - ${require("moment")().format(
                    "L LTS"
                )}] Extract worker > Save raw data error: ${err.message}`
            );
        }
    });

    detailUrlContainer.forEach(d => {
        DetailUrl.findByIdAndUpdate(d._id, d, err => {
            if (err) {
                console.log(
                    `=> [M${process.pid} - ${require("moment")().format(
                        "L LTS"
                    )}] Extract worker > Save detail URL error: ${err.message}`
                );
            }
        });
    });
}, 1000 * REPEAT_TIME.SAVE);

/**
 * check raw data is null or empty
 * @param data
 * @returns {boolean}
 */
function isNullData(data) {
    const {title, price, acreage, address} = data;
    if (
        title.join(" ").trim().length === 0 &&
        price.join(" ").trim().length === 0 &&
        acreage.join(" ").trim().length === 0 &&
        address.join(" ").trim().length === 0
    ) {
        return true;
    }
    return false;
}

/**
 *
 * @param body
 * @param xpath
 * @returns {string}
 */
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
                    .replace(/(\r\n|\n|\r)/gm, "");
                if (text !== "" || text !== null) textData += `${text} `;
            }
        });

    if (textData === "") {
        // get img href
        $(selector)
            .children("img")
            .each(function () {
                textData += `${$(this).attr("src")}`;
            });
    }

    return textData.trim();
}

/**
 *
 * @param body
 * @param definition
 * @returns {{address: [], price: [], acreage: [], title: [], others: []}}
 */
function extractData(body, definition) {
    let title = [];
    let price = [];
    let acreage = [];
    let address = [];
    let othersData = [];

    //title
    definition.title.forEach(xpath => {
        if (getContentByXPath(body, xpath) !== "") {
            title.push(getContentByXPath(body, xpath));
        }
    });

    //price
    definition.price.forEach(xpath => {
        if (getContentByXPath(body, xpath) !== "") {
            price.push(getContentByXPath(body, xpath));
        }
    });

    //acreage
    definition.acreage.forEach(xpath => {
        if (getContentByXPath(body, xpath) !== "") {
            acreage.push(getContentByXPath(body, xpath));
        }
    });

    //address
    definition.address.forEach(xpath => {
        if (getContentByXPath(body, xpath) !== "") {
            address.push(getContentByXPath(body, xpath));
        }
    });

    //other
    definition.others.forEach(e => {
        let data = [];
        e.xpath.forEach(xpath => {
            if (getContentByXPath(body, xpath) !== "") {
                data.push(getContentByXPath(body, xpath));
            }
        });

        if (data.length !== 0) {
            othersData.push({
                name: e.name,
                data: data
            });
        }
    });

    return {
        title: title,
        price: price,
        acreage: acreage,
        address: address,
        others: othersData
    };
}
