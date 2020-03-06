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

export namespace Checker {
    export const DecimalRange = CheckerDecimalRange;
    export type DecimalRange = CheckerDecimalRange;

    export const Domain = CheckerDomain;
    export type Domain = CheckerDomain;

    export const IntegerRange = CheckerIntegerRange;
    export type IntegerRange = CheckerIntegerRange;

    export const MeasureUnit = CheckerMeasureUnit;
    export type MeasureUnit = CheckerMeasureUnit;

    export const StringLength = CheckerStringLength;
    export type StringLength = CheckerStringLength;

    export const Url = CheckerUrl;
    export type Url = CheckerUrl;

    // For type check
    export namespace Type {
        export const Array = CheckerTypeArray;
        export type Array = CheckerTypeArray;

        export const Boolean = CheckerTypeBoolean;
        export type Boolean = CheckerTypeBoolean;

        export const Decimal = CheckerTypeDecimal;
        export type Decimal = CheckerTypeDecimal;

        export const Integer = CheckerTypeInteger;
        export type Integer = CheckerTypeInteger;

        export const Object = CheckerTypeObject;
        export type Object = CheckerTypeObject;

        export const String = CheckerTypeString;
        export type String = CheckerTypeString;
    }
}
