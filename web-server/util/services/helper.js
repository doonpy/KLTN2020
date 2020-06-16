export const numberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
export const calculatePercentage = (partialValue, totalValue) => {
    return ((100 * partialValue) / totalValue).toFixed(2);
};

/**
 * Set Radius for Point Map by acreage
 * @param {number} acreage
 * @return {number} radius
 */
export const setRadiusByArea = (acreage) => {
    if (acreage >= 100000) return 15;
    if (acreage >= 50000 && acreage < 100000) return 12;
    if (acreage < 50000 && acreage >= 10000) return 11;
    if (acreage < 10000 && acreage >= 5000) return 10;
    if (acreage >= 1000 && acreage < 5000) return 8;
    if (acreage >= 500 && acreage < 1000) return 6;
    if (acreage >= 100 && acreage < 500) return 5;
    if (acreage >= 50 && acreage < 100) return 4;
    return 4;
};
/**
 *
 * @param {number} acreage
 */
export const setColorByArea = (acreage) => {
    if (acreage >= 100000) return '#E74C3C';
    if (acreage >= 50000 && acreage < 100000) return '#9B59B6';
    if (acreage < 50000 && acreage >= 10000) return '#2980B9';
    if (acreage < 10000 && acreage >= 5000) return '#48C9B0';
    if (acreage >= 1000 && acreage < 5000) return '#8597FE';
    if (acreage >= 500 && acreage < 1000) return '#40C8F6';
    if (acreage >= 100 && acreage < 500) return '#F1C40F';
    if (acreage >= 50 && acreage < 100) return '#CA6F1E';
    return '#CCD1D1';
};
/**
 *
 * @param {number} price
 */
export const setColorByPrice = (price) => {
    if (price >= 5000) return '#E74C3C';
    if (price >= 1000 && price < 5000) return '#9B59B6';
    if (price >= 500 && price < 1000) return '#2980B9';
    if (price >= 100 && price < 500) return '#48C9B0';
    if (price >= 50 && price < 100) return '#4EB9E9';
    if (price >= 10 && price < 50) return '#40C8F6';
    if (price >= 5 && price < 10) return '#F1C40F';
    if (price >= 1 && price < 5) return '#CA6F1E';
    if (price >= 0.5 && price < 1) return '#A6E4FF';
    if (price >= 0.1 && price < 0.5) return '#CCD1D1 ';
    return '#85929E';
};

/**
 *
 * @param {} price
 */
export const setRadiusByPrice = (price) => {
    if (price >= 5000) return 15;
    if (price >= 1000 && price < 5000) return 12;
    if (price >= 500 && price < 1000) return 10;
    if (price >= 100 && price < 500) return 9;
    if (price >= 50 && price < 100) return 8;
    if (price >= 10 && price < 50) return 7;
    if (price >= 5 && price < 10) return 6;
    if (price >= 1 && price < 5) return 5;
    if (price >= 0.5 && price < 1) return 4;
    if (price >= 0.1 && price < 0.5) return 3;
    return 3;
};

// export const setColorByPrice = (price) => {
//     if (price >= 5000000000000) return '#123D4B';
//     if (price >= 1000000000000 && price < 5000000000000) return '#025570';
//     if (price >= 500000000000 && price < 1000000000000) return '#026F94';
//     if (price >= 100000000000 && price < 500000000000) return '#138BB4';
//     if (price >= 50000000000 && price < 100000000000) return '#1DA0CC';
//     if (price >= 10000000000 && price < 50000000000) return '#40C8F6';
//     if (price >= 5000000000 && price < 10000000000) return '#A9E7FC';
//     if (price >= 1000000000 && price < 5000000000) return '#D6F1FA';
//     if (price >= 500000000 && price < 1000000000) return '#D6F1FA';
//     if (price >= 10000000 && price < 500000000) return '#D6F1FA';
//     return '#D6F1FA';
// };
