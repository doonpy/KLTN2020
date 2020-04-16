import CheckerBase from './checker.base';
import Exception from '../../services/exception/exception.index';
import CheckerFailedResponse from './checker.failed-response';
import ResponseStatusCode from '../../common/common.response-status.code';

export default class CheckerStringLength extends CheckerBase {
    private readonly minRange: number;

    private readonly maxRange: number;

    constructor(minRange: number, maxRange: number | null = null) {
        super();
        this.minRange = minRange;
        this.maxRange = maxRange || Number.MAX_SAFE_INTEGER;
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

        if (!this.checkMinRange(value.length)) {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                CheckerFailedResponse.Message.INVALID_VALUE,
                CheckerFailedResponse.RootCause.OUT_OF_RANGE_SMALLER,
                [paramName, this.minRange, value.length]
            );
        }

        if (!this.checkMaxRange(value.length)) {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                CheckerFailedResponse.Message.INVALID_VALUE,
                CheckerFailedResponse.RootCause.OUT_OF_RANGE_LARGER,
                [paramName, this.minRange, value.length]
            );
        }
    }

    /**
     * @param value
     *
     * @return boolean
     */
    private checkMinRange(value: number): boolean {
        return value >= this.minRange;
    }

    /**
     * @param value
     *
     * @return boolean
     */
    private checkMaxRange(value: number): boolean {
        if (!this.maxRange) {
            return true;
        }
        return value <= this.maxRange;
    }
}
