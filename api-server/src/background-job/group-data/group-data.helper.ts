/**
 * Convert acreage value by measure unit
 * @param {number} value
 * @param {string} fromUnit
 * @param {string} toUnit
 * @return {number} value
 */
export const convertAcreageValue = (value: number, fromUnit: string, toUnit: string): number => {
    if (fromUnit === 'km²' && toUnit === 'm²') {
        return value * 100000;
    }

    if (fromUnit === 'm²' && toUnit === 'km²') {
        return value / 1000000;
    }

    return value;
};

/**
 * Convert price value by currency
 * @param {number} value
 * @param {string} fromUnitInput
 * @param {string} toUnitInput
 * @return {number} returnValue
 */
export const convertPriceValue = (value: number, fromUnitInput: string, toUnitInput: string): number => {
    const CURRENCY_PATTERN = new RegExp(/tỷ|tỉ|triệu|nghìn|ngàn/);
    const fromUnitCurrencyArray: string[] | null = fromUnitInput.match(CURRENCY_PATTERN);
    const toUnitCurrencyArray: string[] | null = toUnitInput.match(CURRENCY_PATTERN);
    const fromUnit: string = fromUnitCurrencyArray ? fromUnitCurrencyArray.shift() || '' : '';
    const toUnit: string = toUnitCurrencyArray ? toUnitCurrencyArray.shift() || '' : '';

    if (!fromUnit || !toUnit) {
        return value;
    }

    let returnValue: number = value;
    switch (fromUnit) {
        case 'tỷ' || 'tỉ':
            if (toUnit === 'triệu') {
                returnValue = value * 1000;
            } else {
                // 'nghìn' || 'ngàn':
                returnValue = value * 1000000;
            }
            break;
        case 'triệu':
            if (toUnit === 'tỷ' || toUnit === 'tỉ') {
                returnValue = value / 1000;
            } else {
                // 'nghìn' || 'ngàn':
                returnValue = value * 1000;
            }
            break;
        default:
            if (toUnit === 'tỷ' || toUnit === 'tỉ') {
                returnValue = value / 1000000;
            } else {
                // triệu
                returnValue = value / 1000;
            }
            break;
    }

    return returnValue;
};
