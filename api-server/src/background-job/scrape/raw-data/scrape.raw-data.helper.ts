import CommonConstant from '@common/common.constant';

export enum NumberUnit {
    THOUSAND,
    MILLION,
    BILLION,
}

export enum MeasureUnit {
    METER,
    KILOMETER,
}

const MEASURE_UNIT_PATTERN = {
    METER: RegExp(/m²|m2/, 'i'),
    KILOMETER: RegExp(/km²|km2/, 'i'),
};

const VALUE_PATTERN = RegExp(/((([1-9]+),*)*[0-9]+(\.[0-9]+)?)/, 'g');
const PRICE_UNIT_PATTERN = {
    THOUSAND: RegExp(/kilo|nghìn|ngàn/, 'i'),
    MILLION: RegExp(/million|triệu/, 'i'),
    BILLION: RegExp(/billion|tỉ|tỷ/, 'i'),
};

/**
 * Convert acreage value by measure unit
 * @param {number} value
 * @param {string} fromUnit
 * @return {number} value
 */
export const convertAcreageValueToMeter = (
    value: number,
    fromUnit: MeasureUnit
): number => {
    if (!value) {
        return NaN;
    }

    if (!(fromUnit in MeasureUnit)) {
        return NaN;
    }

    if (fromUnit === MeasureUnit.KILOMETER) {
        return Math.round((value * 100000 * 100) / 100);
    }

    return Math.round(value * 100) / 100;
};

/**
 * Convert price value by unit
 * @param {number} value
 * @param {string} fromUnit
 * @return {number} returnValue
 */
export const convertPriceValueToK = (
    value: number,
    fromUnit: NumberUnit
): number => {
    if (!value) {
        return NaN;
    }

    if (!(fromUnit in NumberUnit)) {
        return NaN;
    }

    switch (fromUnit) {
        case NumberUnit.BILLION:
            return Math.round(value * 1000000000 * 100) / 100;
        case NumberUnit.MILLION:
            return Math.round(value * 1000000 * 100) / 100;
        default:
            return Math.round(value * 1000 * 100) / 100;
    }
};

/**
 * Get valid data from patterns
 *
 * @param data
 * @param patterns
 */
const getValidDataFromPatterns = (data: string, patterns: RegExp[]): string => {
    let result = '';
    for (const pattern of patterns) {
        result = data.match(pattern)?.shift() || '';

        if (result) {
            break;
        }
    }

    return result;
};

/**
 * @param data
 * @param type
 */
const convertToEnum = (data: string, type: 'price' | 'acreage'): number => {
    switch (type) {
        case 'acreage':
            if (MEASURE_UNIT_PATTERN.METER.test(data)) {
                return MeasureUnit.METER;
            }
            if (MEASURE_UNIT_PATTERN.KILOMETER.test(data)) {
                return MeasureUnit.KILOMETER;
            }
            break;
        case 'price':
            if (PRICE_UNIT_PATTERN.BILLION.test(data)) {
                return NumberUnit.BILLION;
            }

            if (PRICE_UNIT_PATTERN.MILLION.test(data)) {
                return NumberUnit.MILLION;
            }

            if (PRICE_UNIT_PATTERN.THOUSAND.test(data)) {
                return NumberUnit.THOUSAND;
            }
            break;
        default:
            return NaN;
    }

    return NaN;
};

/**
 * Handle price data to price object in raw data schema
 *
 * @param priceData
 * @param transactionType
 * @param acreageValue
 */
export const priceHandler = (
    priceData: string,
    transactionType: number,
    acreageValue: number
) => {
    const PER_METER_PATTERN = RegExp(/\/(m²|m2)/, 'gi');
    const PER_KILOMETER_PATTERN = RegExp(/\/(km²|km2)/, 'gi');
    const PER_YEAR_PATTERN = RegExp(/\/(year|năm)/, 'gi');
    const PER_MONTH_PATTERN = RegExp(/\/(month|tháng)/, 'gi');
    const PER_DAY_PATTERN = RegExp(/\/(day|ngày)/, 'gi');

    const unit = getValidDataFromPatterns(priceData, [
        PRICE_UNIT_PATTERN.BILLION,
        PRICE_UNIT_PATTERN.MILLION,
        PRICE_UNIT_PATTERN.THOUSAND,
    ]);
    let value = Number(
        getValidDataFromPatterns(priceData, [VALUE_PATTERN]) || NaN
    );
    const perTime = getValidDataFromPatterns(priceData, [
        PER_DAY_PATTERN,
        PER_MONTH_PATTERN,
        PER_YEAR_PATTERN,
    ]);
    const perAcreage = getValidDataFromPatterns(priceData, [
        PER_KILOMETER_PATTERN,
        PER_METER_PATTERN,
    ]);

    if (unit) {
        switch (convertToEnum(unit, 'price')) {
            case NumberUnit.BILLION:
                value = convertPriceValueToK(value, NumberUnit.BILLION);
                break;
            case NumberUnit.MILLION:
                value = convertPriceValueToK(value, NumberUnit.MILLION);
                break;
            case NumberUnit.THOUSAND:
                value = convertPriceValueToK(value, NumberUnit.THOUSAND);
                break;
            default:
                break;
        }
    }

    if (perAcreage) {
        value *= acreageValue;
    }

    let timeUnit = NaN;
    if (transactionType === CommonConstant.TRANSACTION_TYPE[1].id) {
        timeUnit = CommonConstant.PRICE_TIME_UNIT.filter(({ wording }) =>
            RegExp(wording.join('|'), 'i').test(perTime)
        )[0].id;
    }

    const priceCurrency = priceData.match(/$/)?.shift()
        ? CommonConstant.PRICE_CURRENCY[1].wording
        : CommonConstant.PRICE_CURRENCY[0].wording;
    const price = {
        value,
        currency: priceCurrency,
        timeUnit,
    };

    if (!price.timeUnit) {
        delete price.timeUnit;
    }

    return price;
};

/**
 * Handle price data to price object in raw data schema
 *
 * @param acreageData
 */
export const acreageHandler = (acreageData: string) => {
    let value = Number(getValidDataFromPatterns(acreageData, [VALUE_PATTERN]));
    const unit = getValidDataFromPatterns(acreageData, [
        MEASURE_UNIT_PATTERN.KILOMETER,
        MEASURE_UNIT_PATTERN.METER,
    ]);

    if (convertToEnum(unit, 'acreage') === MeasureUnit.KILOMETER) {
        value = convertAcreageValueToMeter(value, MeasureUnit.KILOMETER);
    }

    return {
        value,
        measureUnit: 'm²',
    };
};
