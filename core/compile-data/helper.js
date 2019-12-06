const DECIMAL_PATTERN = new RegExp(/^[0-9]+(\.[0-9]+)?/, "g");
const UNIT_PATTERN = new RegExp(/[\D]+$/, "g");

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

module.exports = {
    getSimilarPercentageOfTwoString: getSimilarPercentageOfTwoString,
    standardizedData: standardizedData,
    DECIMAL_PATTERN: DECIMAL_PATTERN,
    UNIT_PATTERN: UNIT_PATTERN
};
