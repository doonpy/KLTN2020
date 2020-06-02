import ResponseStatusCode from '@common/common.response-status.code';
import CheckerTypeBase from './checker.type.base';
import CheckerWording from '../checker.wording';

const NUMERIC_CHARACTER_PATTERN = new RegExp(/^-?\d+$/);

export default class CheckerTypeInteger extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    public checkType(paramName: string, value: any): void {
        if (
            !NUMERIC_CHARACTER_PATTERN.test(value) ||
            !Number.isInteger(Number(value))
        ) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_6,
                    value: [paramName],
                },
            };
        }
    }
}
