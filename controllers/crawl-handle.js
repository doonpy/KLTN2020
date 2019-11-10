const cheerio = require("cheerio");
const DefData = require("../models/def-data-model");
const moment = require("moment");

function mergeArray(array, data) {
    let result = [...array];
    result.concat(data);

    return [...new Set(result)];
}

function mergeOtherDefSameName(otherDef) {
    let result = [];
    otherDef.forEach(odef => {
        let found = result.find(e => e.name === odef.name);

        if (!found) result.push({name: odef.name, xPath: [odef.xPath]});
        else {
            found.xPath.push(odef.xPath);
        }
    });

    return result;
}

function mergeObjArray(array, data) {
    let result = [...array];
    data.forEach(d => {
        let found = result.find(rs => rs.name === d.name);

        if (!found) result.push({name: d.name, xPath: d.xPath});
        else {
            found.xPath = [...new Set(found.xPath.concat(d.xPath))];
        }
    });

    return result;
}

exports.saveDefinition = (host, url, definitions) => {
    // remove null definition
    definitions = definitions.filter(e => {
        return e.def !== "undef";
    });

    let titleDef = definitions.filter(e => e.def === "title").map(e => e.xpath);
    let priceDef = definitions.filter(e => e.def === "price").map(e => e.xpath);
    let acreageDef = definitions
        .filter(e => e.def === "acreage")
        .map(e => e.xpath);
    let addressDef = definitions
        .filter(e => e.def === "address")
        .map(e => e.xpath);
    let otherDef = mergeOtherDefSameName(
        definitions
            .filter(
                e =>
                    e.def !== "title" &&
                    e.def !== "price" &&
                    e.def !== "acreage" &&
                    e.def !== "address"
            )
            .map(e => {
                return {
                    name: e.def,
                    xPath: e.xpath
                };
            })
    );

    DefData.findOne({host: host}, (err, found) => {
        if (err) throw err;

        if (!found) {
            let defData = new DefData({
                host: host,
                definitions: {
                    titlexPath: titleDef,
                    pricexPath: priceDef,
                    acreagexPath: acreageDef,
                    addressxPath: addressDef,
                    other: otherDef
                },
                lastUpdate: moment
                    .utc(new Date())
                    .unix()
                    .valueOf()
            });

            defData.save();
        } else {
            found.definitions.titlexPath = mergeArray(
                found.definitions.titlexPath,
                titleDef
            );

            found.definitions.pricexPath = mergeArray(
                found.definitions.pricexPath,
                priceDef
            );

            found.definitions.acreagexPath = mergeArray(
                found.definitions.acreagexPath,
                acreageDef
            );

            found.definitions.addressxPath = mergeArray(
                found.definitions.addressxPath,
                addressDef
            );

            found.definitions.other = mergeObjArray(
                found.definitions.other,
                otherDef
            );

            found.lastUpdate = moment
                .utc(new Date())
                .unix()
                .valueOf();

            found.save();
        }
    });
};
