import ResponseStatusCode from '@common/common.response-status.code';
import { convertStringToDate } from '@util/helper/datetime';
import CheckerBase from './checker.base';
import CheckerWording from './checker.wording';

export default class CheckerDate extends CheckerBase {
    constructor(private format: string, private delimiter: string) {
        super();
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

        const dateConverted = convertStringToDate(value, this.format, this.delimiter);
        if (dateConverted.toString() === 'Invalid Date') {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_13, value: [value] },
            };
        }
    }
}
