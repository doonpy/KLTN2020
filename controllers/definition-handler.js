const Definition = require("../models/definition-model");

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

exports.saveDefinition = (catalogId, data) => {
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
    Definition.findOne({ catalogId: catalogId }, (err, found) => {
      if (err) {
        reject(err);
        return;
      }
      if (!found) {
        let definition = new Definition({
          catalogId: catalogId,
          title: titleDef,
          price: priceDef,
          acreage: acreageDef,
          address: addressDef,
          others: othersDef
        });

        definition.save((err, def) => {
          if (err) {
            reject(err);
          }
          resolve(def._id);
        });
      } else {
        reject({redirectUrl:`/definition/detail/${found._id}`,err:new Error("Definition is already exists!")})
      }
    });
  });
};
