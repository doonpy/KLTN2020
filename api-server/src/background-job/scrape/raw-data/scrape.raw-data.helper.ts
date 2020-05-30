/**
 * Convert acreage value by measure unit
 * @param {number} value
 * @param {string} fromUnit
 * @param {string} toUnit
 * @return {number} value
 */
export const convertAcreageValue = (value: number, fromUnit: string, toUnit: string): number => {
    if (!value) {
        return value;
    }

    if (fromUnit === 'km²' && toUnit === 'm²') {
        return value * 100000;
    }

    if (fromUnit === 'm²' && toUnit === 'km²') {
        return value / 1000000;
    }

    return Math.round(value * 100) / 100;
};

/**
 * Convert price value by unit
 * @param {number} value
 * @param {string} fromUnitInput
 * @param {string} toUnitInput
 * @return {number} returnValue
 */
export const convertPriceValue = (value: number, fromUnitInput: string, toUnitInput: string): number => {
    if (!value) {
        return value;
    }

    const CURRENCY_PATTERN = new RegExp(/tỷ|tỉ|triệu|nghìn|ngàn/);
    const fromUnitArray: string[] | null = fromUnitInput.match(CURRENCY_PATTERN);
    const toUnitArray: string[] | null = toUnitInput.match(CURRENCY_PATTERN);
    const fromUnit: string = fromUnitArray ? fromUnitArray.shift() || '' : '';
    const toUnit: string = toUnitArray ? toUnitArray.shift() || '' : '';

    if (!fromUnit || !toUnit) {
        return value;
    }

    let returnValue: number = value;
    switch (fromUnit) {
        case 'tỷ' || 'tỉ' || 'billion':
            if (toUnit === 'triệu' || toUnit === 'million') {
                returnValue = value * 1000;
            } else {
                // 'nghìn' || 'ngàn':
                returnValue = value * 1000000000;
            }
            break;
        case 'triệu' || 'million':
            if (toUnit === 'tỷ' || toUnit === 'tỉ' || toUnit === 'billion') {
                returnValue = value / 1000;
            } else {
                // 'nghìn' || 'ngàn':
                returnValue = value * 1000000;
            }
            break;
        default:
            if (toUnit === 'tỷ' || toUnit === 'tỉ' || toUnit === 'billion') {
                returnValue = value / 1000000000;
            } else {
                // triệu
                returnValue = value / 1000000;
            }
            break;
    }

    return Math.round(returnValue);
};
