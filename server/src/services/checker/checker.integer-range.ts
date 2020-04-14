import CheckerBase from './checker.base';
import { Exception } from '../exception/exception.index';
import { Common } from '../../common/common.index';
import { CheckerFailedResponse } from './checker.failed-response';

export default class CheckerIntegerRange extends CheckerBase {
    private readonly minRange: number;
    private readonly maxRange: number;

    constructor(minRange: number, maxRange: number | null) {
        super();
        this.minRange = minRange;
        this.maxRange = maxRange || Number.MAX_SAFE_INTEGER;
    }

    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: any): void {
        let value: any | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        value = Number(value);

        if (!this.checkMinRange(value)) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                CheckerFailedResponse.Message.INVALID_VALUE,
                CheckerFailedResponse.RootCause.OUT_OF_RANGE_SMALLER,
                [paramName, this.minRange, value]
            );
        }

        if (!this.checkMaxRange(value)) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                CheckerFailedResponse.Message.INVALID_VALUE,
                CheckerFailedResponse.RootCause.OUT_OF_RANGE_LARGER,
                [paramName, this.minRange, value]
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
