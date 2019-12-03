require("./configs/database-config").init();
const RawData = require("./models/raw-data-model");

RawData.find({ isGrouped: false })
  .limit(100)
  .exec((err, data) => {
    let loop = setInterval(() => {
      if (data.length === 0) {
        clearInterval(loop);
        return;
      }
      let target = data.shift();
      let targetTitle = target.title.join(" ");
      data.forEach(d => {
        let title = d.title.join(" ");
        console.log(
          target._id,
          d._id,
          getSimilarPercentageOfTwoString(targetTitle, title)
        );
      });
    }, 0);
  });

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
