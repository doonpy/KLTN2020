import CheckerTypeBase from './checker.type.base';
import CheckerWording from '../checker.wording';
import ResponseStatusCode from '@common/common.response-status.code';

export default class CheckerTypeArray extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */

    public checkType(paramName: string, value: any): void {
        if (!Array.isArray(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_11, value: [paramName] },
            };
        }
    }
}
