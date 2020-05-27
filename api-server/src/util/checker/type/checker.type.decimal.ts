import CheckerTypeBase from './checker.type.base';
import CheckerWording from '../checker.wording';
import ResponseStatusCode from '@common/common.response-status.code';

// const DECIMAL_NUMERIC_CHARACTER_PATTERN = new RegExp(/(^([1-9]+)?0?\.[0-9]+$)|\d/);

export default class CheckerTypeDecimal extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */

    public checkType(paramName: string, value: any): void {
        if (!Number(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_7, value: [paramName] },
            };
        }
    }
}
