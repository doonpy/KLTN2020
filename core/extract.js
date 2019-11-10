const DefData = require("../models/def-data-model");
const RawData = require("../models/raw-data-model");
const cheerio = require("cheerio");
const NODE_TYPE_TEXT = 3;

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

exports.extractByDefinition = (host, url, body) => {
    DefData.findOne({host: host}, (err, def) => {
        if (err) throw err;
        if (!def) return false;

        let definitions = def.definitions;
        let title = [];
        let price = [];
        let acreage = [];
        let address = [];
        let otherData = [];

        //title
        definitions.titlexPath.forEach(xpath => {
            title.push(getContentByXPath(body, xpath));
        });

        //price
        definitions.pricexPath.forEach(xpath => {
            price.push(getContentByXPath(body, xpath));
        });

        //acreage
        definitions.acreagexPath.forEach(xpath => {
            acreage.push(getContentByXPath(body, xpath));
        });

        //address
        definitions.addressxPath.forEach(xpath => {
            address.push(getContentByXPath(body, xpath));
        });

        //other
        definitions.other.forEach(e => {
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

        rawData.save();
    });
};
