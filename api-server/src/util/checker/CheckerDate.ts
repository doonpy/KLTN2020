import ResponseStatusCode from '@common/response-status-code';
import { convertStringToDate } from '@util/helper/datetime';
import CheckerBase from './CheckerBase';
import CheckerWording from './wording';

export default class CheckerDate extends CheckerBase {
    constructor(private format: string) {
        super();
    }

    public check(paramName: string, input: Record<string, any>): void {
        const value = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (!convertStringToDate(value, this.format)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_13,
                    value: [value],
                },
            };
        }
    }
}
