require("./configs/database-config").init();
const RawData = require("./models/raw-data-model");
const Catalog = require("./models/catalog-model");
const async = require("async");

const SIMILAR_RATES = {
  CATALOG: 50
};
const TOTAL_POINT = 10;
const POINT_EACH_ATTR = 2;

async.parallel(
    {
      rawData: function (callback) {
        RawData.find({isGrouped: false})
            .limit(1000)
            .populate({path: "detailUrlId", populate: {path: "catalogId"}})
            .exec(callback);
      },
      catalogs: function (callback) {
        Catalog.find().exec(callback);
      }
    },
    (err, data) => {
      if (err) {
        throw err;
      }
      const {rawData, catalogs} = data;
      let groupedCatalogs = groupedCatalog(catalogs);
      let rawDataByGroupedCatalog = getDataByGroupedCatalog(
          groupedCatalogs,
          rawData
      );

      rawDataByGroupedCatalog.forEach(rd => {
        console.log(rd.rawData);
        if (rd.rawData.length > 0) {
          for (let i = 0; i < rd.rawData.length; i++) {
            for (let j = i + 1; j < rd.rawData.length; j++) {
              const titlePoint = pointCalculatorByType(
                  "title",
                  rd.rawData[i],
                  rd.rawData[j]
              );
              const pricePoint = pointCalculatorByType(
                  "price",
                  rd.rawData[i],
                  rd.rawData[j]
              );
              const acreagePoint = pointCalculatorByType(
                  "acreage",
                  rd.rawData[i],
                  rd.rawData[j]
              );
              const addressPoint = pointCalculatorByType(
                  "address",
                  rd.rawData[i],
                  rd.rawData[j]
              );
            }
          }
        }
      });

      // console.log(rawDataByGroupedCatalog);
    }
);

function pointCalculatorByType(type, firstTarget, secondTarget) {
  let point = 0;
  if (type === "others") {
    // TODO: Implement calculator point for others attribute :(
  } else {
    point =
        (getSimilarPercentageOfTwoString(
            firstTarget[type].join(" "),
            secondTarget[type].join(" ")
            ) *
            POINT_EACH_ATTR) /
        100;
  }

  return point.toFixed(2);
}

/**
 * grouped data by catalog which was grouped before
 * @param groupedCatalogs
 * @param rawData
 * @returns {[]}
 */
function getDataByGroupedCatalog(groupedCatalogs, rawData) {
  let rawDataByGroupedCatalog = [];

  groupedCatalogs.forEach(gCtl => {
    let rawDataArray = [];
    rawData.forEach(rd => {
      let catalogId = rd.detailUrlId.catalogId._id.toString();
      if (gCtl.find(c => c === catalogId)) {
        rawDataArray.push(rd);
      }
    });
    rawDataByGroupedCatalog.push({
      groupedCatalog: gCtl,
      rawData: rawDataArray
    });
  });

  return rawDataByGroupedCatalog;
}

/**
 * group catalog with declared percent
 * @param catalogs
 */
function groupedCatalog(catalogs) {
  let groupedCatalogs = [];
  for (let i = 0; i < catalogs.length; i++) {
    let similarCatalogs = [catalogs[i]._id.toString()];
    for (let j = i + 1; j < catalogs.length; j++) {
      if (
          isSameCatalogType(catalogs[i], catalogs[j]) &&
          getSimilarPercentageOfTwoString(catalogs[i].name, catalogs[j].name) >=
          SIMILAR_RATES.CATALOG
      ) {
        similarCatalogs.push(catalogs[j]._id.toString());
      }
    }
    groupedCatalogs.push(similarCatalogs);
  }

  return groupedCatalogs;
}

/**
 * check basic case to detect type of two catalogs
 * @param firstCatalog
 * @param secondCatalog
 * @returns {boolean}
 */
function isSameCatalogType(firstCatalog, secondCatalog) {
  const firstCatalogName = standardizedData(firstCatalog.name);
  const secondCatalogName = standardizedData(secondCatalog.name);

  if (firstCatalogName.includes("bán") && secondCatalogName.includes("thuê")) {
    return false;
  }

  if (firstCatalogName.includes("thuê") && secondCatalogName.includes("bán")) {
    return false;
  }

  if (firstCatalogName.includes("đất") && secondCatalogName.includes("nhà")) {
    return false;
  }

  if (firstCatalogName.includes("nhà") && secondCatalogName.includes("đất")) {
    return false;
  }

  return true;
}

/**
 *
 * @param firstString
 * @param secondString
 * @returns {number} percentage
 */
function getSimilarPercentageOfTwoString(firstString, secondString) {
  if (firstString === secondString) {
    return 100;
  }

  let firstStringWords = standardizedData(firstString).split(" ");
  let secondStringWords = standardizedData(secondString).split(" ");

  if (firstStringWords.length === 0 || secondStringWords.length === 0) {
    return 0;
  }

  let maxLen =
    firstStringWords.length > secondStringWords.length
      ? firstStringWords.length
      : secondStringWords.length;
  let similarLen = firstStringWords.filter(w => secondStringWords.includes(w))
    .length;

  return parseFloat(((similarLen / maxLen) * 100).toFixed(2));
}

/**
 * standardize string
 * @param originalString
 * @returns {string}
 */
function standardizedData(originalString) {
  return originalString
      .toLowerCase()
      .replace(/[^\w\d\s\u00C0-\u1EF9]/g, " ")
      .trim();
}

// let loop = setInterval(() => {
//   if (data.length === 0) {
//     clearInterval(loop);
//     return;
//   }
//   let target = data.shift();
//   let targetTitle = target.title.join(" ");
//   data.forEach(d => {
//     let title = d.title.join(" ");
//     console.log(
//       target._id,
//       d._id,
//       getSimilarPercentageOfTwoString(targetTitle, title)
//     );
//   });
// }, 0);
