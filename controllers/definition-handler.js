const Definition = require("../models/definition-model");
const DetailUrl = require("../models/detail-url-model");
const async = require("async");

function mergeOtherDefSameName(otherDef) {
  let result = [];
  otherDef.forEach(odef => {
    let found = result.find(e => e.name === odef.name);

    if (!found) result.push({ name: odef.name, xpath: [odef.xpath] });
    else {
      found.xpath.push(odef.xpath);
    }
  });

  return result;
}

exports.saveDefinition = (catalogId, targetUrl, data) => {
  return new Promise((resolve, reject) => {
    // remove null definition
    data = data.filter(e => {
      return e.def !== "undef";
    });

    let titleDef = data.filter(e => e.def === "title").map(e => e.xpath);
    let priceDef = data.filter(e => e.def === "price").map(e => e.xpath);
    let acreageDef = data.filter(e => e.def === "acreage").map(e => e.xpath);
    let addressDef = data.filter(e => e.def === "address").map(e => e.xpath);
    let othersDef = mergeOtherDefSameName(
      data
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
            xpath: e.xpath
          };
        })
    );
    async.parallel(
      {
        definition: function(callback) {
          Definition.findOne({ catalogId: catalogId }).exec(callback);
        },
        targetUrl: function(callback) {
          DetailUrl.findOne({ url: targetUrl }).exec(callback);
        }
      },
      (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        const { definition, targetUrl } = data;
        console.log(targetUrl);
        if (!targetUrl) {
          reject({
            redirectUrl: ``,
            err: new Error("Target URL is invalid!")
          });
          return;
        }

        if (!definition) {
          let newDefinition = new Definition({
            catalogId: catalogId,
            targetUrl: targetUrl ? targetUrl._id : "",
            title: titleDef,
            price: priceDef,
            acreage: acreageDef,
            address: addressDef,
            others: othersDef
          });

          newDefinition.save((err, def) => {
            if (err) {
              reject(err);
            }
            resolve(def._id);
          });
        } else {
          // Update definition
          definition.targetUrl = targetUrl ? targetUrl._id : "";
          definition.title = titleDef;
          definition.price = priceDef;
          definition.acreage = acreageDef;
          definition.address = addressDef;
          definition.others = othersDef;

          definition.save(err => {
            if (err) {
              reject({
                redirectUrl: `/definition/detail/${definition._id}`,
                err: new Error("Edit definition failed (DB)!")
              });
            }
          });
        }
      }
    );
  });
};
