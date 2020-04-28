import CheckerBase from './checker.base';
import CheckerWording from './checker.wording';
import ResponseStatusCode from '../../common/common.response-status.code';

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
    public check(paramName: string, input: { [key: string]: string } | null | string): void {
        let value: string | null | number = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        value = Number(value);

        if (!this.checkMinRange(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_3, value: [paramName, this.minRange, value] },
            };
        }

        if (!this.checkMaxRange(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_4, value: [paramName, this.maxRange, value] },
            };
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
