import CheckerBase from '../base/checker.base';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { Cause } from '../../util/definition/error/cause';
import { ErrorMessage } from '../../util/definition/error/message';

class IntegerRangeChecker extends CheckerBase {
    private minRange: number;
    private maxRange: number;

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
            throw new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                ErrorMessage.PARAM.INVALID_VALUE,
                Cause.DATA_VALUE.OUT_OF_RANGE_SMALLER,
                [paramName, this.minRange, value]
            );
        }

        if (!this.checkMaxRange(value)) {
            throw new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                ErrorMessage.PARAM.INVALID_VALUE,
                Cause.DATA_VALUE.OUT_OF_RANGE_LARGER,
                [paramName, this.maxRange, value]
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

export default IntegerRangeChecker;
