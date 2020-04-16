import CheckerBase from './checker.base';
import Exception from '../../services/exception/exception.index';
import CheckerFailedResponse from './checker.failed-response';
import ResponseStatusCode from '../../common/common.response-status.code';

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
    public check(paramName: string, input: { [key: string]: string } | null | string): void {
        const value: string | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (this.measureUnit !== encodeURI(value)) {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                CheckerFailedResponse.Message.INVALID_VALUE,
                CheckerFailedResponse.RootCause.MEASURE_UNIT,
                [value, decodeURI(this.measureUnit)]
            );
        }
    }
}
