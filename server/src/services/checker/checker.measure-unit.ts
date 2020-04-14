import CheckerBase from './checker.base';
import { Exception } from '../exception/exception.index';
import { Common } from '../../common/common.index';
import { CheckerFailedResponse } from './checker.failed-response';

export default class CheckerMeasureUnit extends CheckerBase {
    private readonly measureUnit: string;

    constructor(measureUnit: string) {
        super();
        this.measureUnit = encodeURI(measureUnit);
    }

    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: object): void {
        let value: any | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (this.measureUnit !== encodeURI(value)) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                CheckerFailedResponse.Message.INVALID_VALUE,
                CheckerFailedResponse.RootCause.MEASURE_UNIT,
                [value, decodeURI(this.measureUnit)]
            );
        }
    }
}
