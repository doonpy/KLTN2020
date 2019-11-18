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

    if (!found) result.push({ name: odef.name, xPath: [odef.xPath] });
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

    if (!found) result.push({ name: d.name, xPath: d.xPath });
    else {
      found.xPath = [...new Set(found.xPath.concat(d.xPath))];
    }
  });

  return result;
}

exports.saveDefinition = (hostname, filename, catalogName, definitions) => {
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

  Definition.findOne(
    { "definitions.catalogName": catalogName },
    (err, found) => {
      if (err) {
        throw err;
      }
      if (!found) {
        let definition = {
          catalogName: catalogName,
          titlexPath: titleDef,
          pricexPath: priceDef,
          acreagexPath: acreageDef,
          addressxPath: addressDef,
          other: otherDef,
          lastUpdate: moment(new Date()).valueOf()
        };

        Definition.findOne({ hostname: hostname }, {}, (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            data.definitions.push(definition);
            data.save(err => {
              if (err) {
                throw err;
              }
            });
          } else {
            let defData = new Definition({
              hostname: hostname,
              definitions: [definition]
            });
            defData.save(err => {
              if (err) {
                throw err;
              }
            });
          }
        });
      } else {
        let definition = found.definitions.find(
          d => d.catalogName === catalogName
        );
        definition.titlexPath = mergeArray(definition.titlexPath, titleDef);
        definition.pricexPath = mergeArray(definition.pricexPath, priceDef);
        definition.acreagexPath = mergeArray(
          definition.acreagexPath,
          acreageDef
        );
        definition.addressxPath = mergeArray(
          definition.addressxPath,
          addressDef
        );
        definition.other = mergeObjArray(definition.other, otherDef);
        definition.lastUpdate = moment(new Date()).valueOf();

        found.save(err => {
          if (err) {
            throw err;
          }
        });
      }
    }
  );
};
