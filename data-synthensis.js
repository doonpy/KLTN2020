require("./configs/database-config").init();
const RawData = require("./models/raw-data-model");
const Catalog = require("./models/catalog-model");
const CleanData = require("./models/clean-data-model");
const async = require("async");

const SIMILAR_RATES = {
  CATALOG: 50
};
const EXPECTED_POINT = 8;
const TOTAL_POINT = 10;
const POINT_EACH_ATTR = {
  TITLE: 2,
  PRICE: 2,
  ACREAGE: 2,
  ADDRESS: 3,
  OTHERS: 1
};
const DECIMAL_PATTERN = new RegExp(/^[0-9]+(\.[0-9]+)?/, "g");
const UNIT_PATTERN = new RegExp(/[\D]+$/, "g");

/**
 * Check point sheet is valid
 * @returns {boolean}
 */
function isPointSheetValid() {
  let sum = 0;
  for (let key in POINT_EACH_ATTR) {
    sum += POINT_EACH_ATTR[key];
  }
  if (sum > TOTAL_POINT) {
    return false;
  }
  return true;
}

async.parallel(
  {
    rawData: function(callback) {
      RawData.find({ isGrouped: false })
        .limit(300)
        .populate({ path: "detailUrlId", populate: { path: "catalogId" } })
        .exec(callback);
    },
    catalogs: function(callback) {
      Catalog.find().exec(callback);
    }
  },
  (err, data) => {
    if (err) {
      throw err;
    }
    const { rawData, catalogs } = data;
    let groupedCatalogs = groupedCatalog(catalogs);
    let rawDataByGroupedCatalog = getDataByGroupedCatalog(
      groupedCatalogs,
      rawData
    );
    let similarDataByCatalog = [];
    rawDataByGroupedCatalog.forEach(rd => {
      if (rd.rawData.length > 0) {
        for (let i = 0; i < rd.rawData.length; i++) {
          let similarData = [rd.rawData[i]._id];
          for (let j = i + 1; j < rd.rawData.length; j++) {
            let totalPoint = 0;

            const addressPoint = pointCalculatorByType(
              "address",
              rd.rawData[i],
              rd.rawData[j],
              POINT_EACH_ATTR.ADDRESS
            );
            totalPoint += addressPoint;
            if (totalPoint > EXPECTED_POINT) {
              similarData.push(rd.rawData[j]._id);
              continue;
            }

            const acreagePoint = pointCalculatorByType(
              "acreage",
              rd.rawData[i],
              rd.rawData[j],
              POINT_EACH_ATTR.ACREAGE
            );
            totalPoint += acreagePoint;
            if (totalPoint > EXPECTED_POINT) {
              similarData.push(rd.rawData[j]._id);
              continue;
            }

            const pricePoint = pointCalculatorByType(
              "price",
              rd.rawData[i],
              rd.rawData[j],
              POINT_EACH_ATTR.PRICE
            );
            totalPoint += pricePoint;
            if (totalPoint > EXPECTED_POINT) {
              similarData.push(rd.rawData[j]._id);
              continue;
            }

            const titlePoint = pointCalculatorByType(
              "title",
              rd.rawData[i],
              rd.rawData[j],
              POINT_EACH_ATTR.TITLE
            );
            totalPoint += titlePoint;
            if (totalPoint > EXPECTED_POINT) {
              similarData.push(rd.rawData[j]._id);
              continue;
            }

            const othersPoint = pointCalculatorByType(
              "others",
              rd.rawData[i],
              rd.rawData[j],
              POINT_EACH_ATTR.OTHERS
            );
            totalPoint += othersPoint;
            if (totalPoint > EXPECTED_POINT) {
              similarData.push(rd.rawData[j]._id);
            }
          }
          if (similarData.length > 1) {
            similarDataByCatalog.push({
              catalogIds: rd.groupedCatalog,
              data: similarData
            });
          }
        }
      }
    });

    console.log(similarDataByCatalog);
    CleanData.insertMany(similarDataByCatalog, err => {
      if (err) {
        throw err;
      }
    });
  }
);

function pointCalculatorByType(
  type,
  firstTarget,
  secondTarget,
  pointEachAttr = 0
) {
  let point = 0;
  switch (type) {
    case "others":
      let similarOthers = [];
      firstTarget[type].forEach(fto => {
        secondTarget[type].forEach(sto => {
          if (fto.name === sto.name) {
            let isNumber = DECIMAL_PATTERN.test(fto.data.join(" "));
            similarOthers.push(
              getSimilarPercentageOfTwoString(
                fto.data.join(" "),
                sto.data.join(" "),
                isNumber
              )
            );
          }
        });
      });

      let pointEachOther = pointEachAttr / similarOthers.length;
      similarOthers.forEach(so => {
        point += (so * pointEachOther) / 100;
      });
      break;
    case "price":
      point =
        (getSimilarPercentageOfTwoString(
          firstTarget[type].join(" "),
          secondTarget[type].join(" "),
          true
        ) *
          pointEachAttr) /
        100;
      break;
    case "acreage":
      point =
        (getSimilarPercentageOfTwoString(
          firstTarget[type].join(" "),
          secondTarget[type].join(" "),
          true
        ) *
          pointEachAttr) /
        100;
      break;
    default:
      point =
        (getSimilarPercentageOfTwoString(
          firstTarget[type].join(" "),
          secondTarget[type].join(" ")
        ) *
          pointEachAttr) /
        100;
      break;
  }

  return parseFloat(point.toFixed(2));
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
      if (gCtl.find(c => c.toString() === catalogId)) {
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
    let similarCatalogs = [catalogs[i]._id];
    for (let j = i + 1; j < catalogs.length; j++) {
      if (
        isSameCatalogType(catalogs[i], catalogs[j]) &&
        getSimilarPercentageOfTwoString(catalogs[i].name, catalogs[j].name) >=
          SIMILAR_RATES.CATALOG
      ) {
        similarCatalogs.push(catalogs[j]._id);
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
 * @param isNumber
 * @returns {number} percentage
 */
function getSimilarPercentageOfTwoString(
  firstString,
  secondString,
  isNumber = false
) {
  if (firstString === secondString) {
    return 100;
  }

  if (isNumber) {
    let firstAmount = standardizedData(firstString).match(DECIMAL_PATTERN)
      ? parseFloat(
          standardizedData(firstString, true)
            .match(DECIMAL_PATTERN)
            .join(" ")
            .trim()
        )
      : "";

    let secondAmount = standardizedData(secondString).match(DECIMAL_PATTERN)
      ? parseFloat(
          standardizedData(secondString, true)
            .match(DECIMAL_PATTERN)
            .join(" ")
            .trim()
        )
      : "";

    let firstCurrency = standardizedData(firstString).match(UNIT_PATTERN)
      ? standardizedData(firstString, true)
          .match(UNIT_PATTERN)
          .join(" ")
          .trim()
      : "";
    let secondCurrency = standardizedData(secondString).match(UNIT_PATTERN)
      ? standardizedData(secondString, true)
          .match(UNIT_PATTERN)
          .join(" ")
          .trim()
      : "";

    // khác đơn vị
    if (
      firstCurrency === "" ||
      secondCurrency === "" ||
      firstCurrency !== secondCurrency
    ) {
      return 0;
    }

    // thỏa thuận, không xác định
    if (
      firstAmount === "" &&
      secondAmount === "" &&
      firstCurrency === secondCurrency
    ) {
      return 100;
    }

    let max = firstAmount > secondAmount ? firstAmount : secondAmount;
    return parseFloat(
      (100 - (Math.abs(firstAmount - secondAmount) / max) * 100).toFixed(2)
    );
  } else {
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
}

/**
 * standardize string
 * @param originalString
 * @returns {string}
 */
function standardizedData(originalString, isUnit = false) {
  if (isUnit) {
    return originalString
      .toLowerCase()
      .replace(/[^\w\d\s\u00C0-\u1EF9\.\/]/g, " ")
      .trim();
  }
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
