import CheckerTypeBase from './checker.type.base';
import CheckerWording from '../checker.wording';
import ResponseStatusCode from '../../../common/common.response-status.code';

export default class CheckerTypeBoolean extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public checkType(paramName: string, value: any): void {
        if (value !== 'true' && value !== 'false') {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_10, value: [paramName] },
            };
        }
    }
}
