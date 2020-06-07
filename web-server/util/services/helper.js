export const numberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
export const calculatePercentage = (partialValue, totalValue) => {
    return ((100 * partialValue) / totalValue).toFixed(2);
};
export const setRadiusByArea = (acreage) => {
    if (acreage >= 100000) return 30;
    if (acreage >= 50000 < 100000) return 20;
    if (acreage < 50000 && acreage >= 10000) return 12;
    if (acreage < 10000 && acreage >= 5000) return 10;
    if (acreage >= 1000 && acreage < 5000) return 8;
    if (acreage >= 800 && acreage < 1000) return 6;
    if (acreage >= 500 && acreage < 800) return 4;
    return 1;
};
export const setRadiusByPrice = (price) => {
    if (price >= 5000000000000) return 20;
    if (price >= 1000000000000 && price < 5000000000000) return 15;
    if (price >= 500000000000 && price < 1000000000000) return 10;
    if (price >= 100000000000 && price < 500000000000) return 9;
    if (price >= 50000000000 && price < 100000000000) return 8;
    if (price >= 30000000000 && price < 50000000000) return 7;
    if (price >= 10000000000 && price < 30000000000) return 6;
    return 5;
};
export const setColorByArea = (acreage) => {
    if (acreage >= 100000) return '#A3FF33';
    if (acreage >= 50000 && acreage < 100000) return '#3388ff';
    if (acreage >= 10000 && acreage < 50000) return 'red';
    if (acreage < 10000 && acreage >= 5000) return '#27AE60';
    if (acreage >= 1000 && acreage < 5000) return '#884EA0';
    if (acreage >= 800 && acreage < 1000) return '#F4D03F';
    if (acreage >= 500 && acreage < 800) return '#B9770E ';
    return '#D0D3D4';
};
export const setColorByPrice = (price) => {
    if (price >= 5000000000000) return '#A3FF33';
    if (price >= 1000000000000 && price < 5000000000000) return '#3388ff';
    if (price >= 500000000000 && price < 1000000000000) return 'red';
    if (price >= 100000000000 && price < 500000000000) return '#27AE60';
    if (price >= 50000000000 && price < 100000000000) return '#884EA0';
    if (price >= 30000000000 && price < 50000000000) return '#F4D03F';
    if (price >= 10000000000 && price < 30000000000) return '#B9770E ';
    return '#D0D3D4';
};
