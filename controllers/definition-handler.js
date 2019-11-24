const Definition = require("../models/definition-model");
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

    if (!found) result.push({name: odef.name, xpath: [odef.xpath]});
    else {
      found.xpath.push(odef.xpath);
    }
  });

  return result;
}

function mergeObjArray(array, data) {
  let result = [...array];
  data.forEach(d => {
    let found = result.find(rs => rs.name === d.name);

    if (!found) result.push({name: d.name, xpath: d.xpath});
    else {
      found.xpath = [...new Set(found.xpath.concat(d.xpath))];
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
    Definition.findOne({catalogId: catalogId}, (err, found) => {
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

        definition.save(err => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      } else {
        found.title = mergeArray(found.title, titleDef);
        found.pricex = mergeArray(found.price, priceDef);
        found.acreage = mergeArray(found.acreage, acreageDef);
        found.address = mergeArray(found.address, addressDef);
        found.others = mergeObjArray(found.others, othersDef);

        found.save(err => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      }
    });
  });
};
