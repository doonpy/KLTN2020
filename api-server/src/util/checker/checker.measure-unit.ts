import ResponseStatusCode from '@common/common.response-status.code';
import CheckerBase from './checker.base';
import CheckerWording from './checker.wording';

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
        const value = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (this.measureUnit !== encodeURI(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_5, value: [value, decodeURI(this.measureUnit)] },
            };
        }
    }
}
