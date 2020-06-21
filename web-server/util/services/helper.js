import { COLOR_CODE } from '../constants';
import moment from 'moment';

export const numberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
export const calculatePercentage = (partialValue, totalValue) => {
    return ((100 * partialValue) / totalValue).toFixed(2);
};
/**
 *
 * @param {number} month //6 12 24
 * @return {object} {year, month}
 */
export const getTimeAgo = (month) => {
    const dateAgo = moment().subtract(month, 'months');
    return {
        year: +dateAgo.format('YYYY'),
        month: +dateAgo.format('MM'),
    };
};
/**
 *
 * @param {number} acreage
 */
export const setColor = (value, valueRange) => {
    if (value >= valueRange[valueRange.length - 1]) {
        return COLOR_CODE[COLOR_CODE.length - 1];
    }
    for (let i = 0; i <= valueRange.length; i++) {
        if (value >= valueRange[i] && value < valueRange[i + 1]) {
            return COLOR_CODE[i];
        }
    }
    return '';
};
