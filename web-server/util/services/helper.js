export const numberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
export const calculatePercentage = (partialValue, totalValue) => {
    return ((100 * partialValue) / totalValue).toFixed(2);
};
