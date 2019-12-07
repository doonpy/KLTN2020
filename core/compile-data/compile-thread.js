const {workerData, parentPort} = require("worker_threads");
const helper = require("./helper");

const POINT_EACH_ATTR = {
  TITLE: 2,
  PRICE: 2,
  ACREAGE: 2,
  ADDRESS: 3,
  OTHERS: 1
};
const EXPECTED_POINT = 9;

const rawDataByCatalog = JSON.parse(workerData);
parentPort.postMessage(JSON.stringify(groupRawData(rawDataByCatalog)));

/**
 * Woker function
 * @param rawDataByCatalog
 */
function groupRawData(rawDataByCatalog) {
  let groupData = [];

  while (rawDataByCatalog.rawData.length > 0) {
    let srcRawData = rawDataByCatalog.rawData.shift();
    let similarData = [srcRawData._id];
    rawDataByCatalog.rawData = rawDataByCatalog.rawData.filter(desRawData => {
      let totalPoint = 0;
      const addressPoint = pointCalculatorByType(
          "address",
          srcRawData,
          desRawData,
          POINT_EACH_ATTR.ADDRESS
      );
      totalPoint += addressPoint;
      if (totalPoint > EXPECTED_POINT) {
        similarData.push(desRawData._id);
        desRawData.isGrouped = true;
        return false;
      }

      const acreagePoint = pointCalculatorByType(
          "acreage",
          srcRawData,
          desRawData,
          POINT_EACH_ATTR.ACREAGE
      );
      totalPoint += acreagePoint;
      if (totalPoint > EXPECTED_POINT) {
        similarData.push(desRawData._id);
        return false;
      }

      const pricePoint = pointCalculatorByType(
          "price",
          srcRawData,
          desRawData,
          POINT_EACH_ATTR.PRICE
      );
      totalPoint += pricePoint;
      if (totalPoint > EXPECTED_POINT) {
        similarData.push(desRawData._id);
        return false;
      }

      const titlePoint = pointCalculatorByType(
          "title",
          srcRawData,
          desRawData,
          POINT_EACH_ATTR.TITLE
      );
      totalPoint += titlePoint;
      if (totalPoint > EXPECTED_POINT) {
        similarData.push(desRawData._id);
        return false;
      }

      const othersPoint = pointCalculatorByType(
          "others",
          srcRawData,
          desRawData,
          POINT_EACH_ATTR.OTHERS
      );
      totalPoint += othersPoint;
      if (totalPoint > EXPECTED_POINT) {
        similarData.push(desRawData._id);
        return false;
      }

      return true;
    });
    if (similarData.length > 1) {
      groupData.push({
        catalogIds: rawDataByCatalog.groupedCatalog,
        groupData: similarData
      });
    }
  }

  return groupData;
}

/**
 * Calculate point by type of attribute
 * @param type
 * @param firstTarget
 * @param secondTarget
 * @param pointEachAttr
 * @returns {number}
 */
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
            let isNumber = helper.DECIMAL_PATTERN.test(fto.data.join(" "));
            similarOthers.push(
                helper.getSimilarPercentageOfTwoString(
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
          (helper.getSimilarPercentageOfTwoString(
              firstTarget[type].join(" "),
              secondTarget[type].join(" "),
              true
              ) *
              pointEachAttr) /
          100;
      break;
    case "acreage":
      point =
          (helper.getSimilarPercentageOfTwoString(
              firstTarget[type].join(" "),
              secondTarget[type].join(" "),
              true
              ) *
              pointEachAttr) /
          100;
      break;
    default:
      point =
          (helper.getSimilarPercentageOfTwoString(
              firstTarget[type].join(" "),
              secondTarget[type].join(" ")
              ) *
              pointEachAttr) /
          100;
      break;
  }

  return parseFloat(point.toFixed(2));
}
