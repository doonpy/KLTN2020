import CheckerDate from './checker.date';
import CheckerDecimalRange from './checker.decimal-range';
import CheckerDomain from './checker.domain';
import CheckerIntegerRange from './checker.integer-range';
import CheckerMeasureUnit from './checker.measure-unit';
import CheckerStringLength from './checker.string-length';
import CheckerUrl from './checker.url';
import CheckerTypeArray from './type/checker.type.array';
import CheckerTypeBoolean from './type/checker.type.boolean';
import CheckerTypeDecimal from './type/checker.type.decimal';
import CheckerTypeInteger from './type/checker.type.integer';
import CheckerTypeObject from './type/checker.type.object';
import CheckerTypeString from './type/checker.type.string';
import CheckerLanguage from './checker.language';

export default {
    Type: {
        Array: CheckerTypeArray,
        Boolean: CheckerTypeBoolean,
        Decimal: CheckerTypeDecimal,
        Integer: CheckerTypeInteger,
        Object: CheckerTypeObject,
        String: CheckerTypeString,
    },
    DecimalRange: CheckerDecimalRange,
    Domain: CheckerDomain,
    IntegerRange: CheckerIntegerRange,
    MeasureUnit: CheckerMeasureUnit,
    StringLength: CheckerStringLength,
    Url: CheckerUrl,
    Language: CheckerLanguage,
    Date: CheckerDate,
};
