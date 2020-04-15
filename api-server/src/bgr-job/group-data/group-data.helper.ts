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
 * @param {string} fromUnit
 * @param {string} toUnit
 * @return {number} returnValue
 */
export const convertPriceValue = (value: number, fromUnit: string, toUnit: string): number => {
    const CURRENCY_PATTERN: RegExp = new RegExp(/tỷ|tỉ|triệu|nghìn|ngàn/);
    const fromUnitCurrencyArray: string[] | null = fromUnit.match(CURRENCY_PATTERN);
    const toUnitCurrencyArray: string[] | null = toUnit.match(CURRENCY_PATTERN);
    fromUnit = fromUnitCurrencyArray ? fromUnitCurrencyArray.shift() || '' : '';
    toUnit = toUnitCurrencyArray ? toUnitCurrencyArray.shift() || '' : '';

    if (!fromUnit || !toUnit) {
        return value;
    }

    let returnValue: number = value;
    switch (fromUnit) {
        case 'tỷ' || 'tỉ':
            switch (toUnit) {
                case 'triệu':
                    returnValue = value * 1000;
                    break;
                case 'nghìn' || 'ngàn':
                    returnValue = value * 1000000;
                    break;
            }
            break;
        case 'triệu':
            switch (toUnit) {
                case 'tỷ' || 'tỉ':
                    returnValue = value / 1000;
                    break;
                case 'nghìn' || 'ngàn':
                    returnValue = value * 1000;
                    break;
            }
            break;
        case 'nghìn' || 'ngàn':
            switch (toUnit) {
                case 'tỷ' || 'tỉ':
                    returnValue = value / 1000000;
                    break;
                case 'triệu':
                    returnValue = value / 1000;
                    break;
            }
            break;
    }

    return returnValue;
};
