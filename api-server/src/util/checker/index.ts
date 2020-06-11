import CheckerDate from './CheckerDate';
import CheckerDecimalRange from './CheckerDecimalRange';
import CheckerDomain from './CheckerDomain';
import CheckerIntegerRange from './CheckerIntegerRange';
import CheckerMeasureUnit from './CheckerMeasureUnit';
import CheckerStringLength from './CheckerStringLength';
import CheckerUrl from './CheckerUrl';
import CheckerTypeArray from './type/CheckerTypeArray';
import CheckerTypeBoolean from './type/CheckerTypeBoolean';
import CheckerTypeDecimal from './type/CheckerTypeDecimal';
import CheckerTypeInteger from './type/CheckerTypeInteger';
import CheckerTypeObject from './type/CheckerTypeObject';
import CheckerTypeString from './type/CheckerTypeString';
import CheckerLanguage from './CheckerLanguage';

const Checker = {
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

export default Checker;
