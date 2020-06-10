import ResponseStatusCode from '@common/response-status-code';
import CheckerTypeBase from './CheckerTypeBase';
import CheckerWording from '../wording';

export default class CheckerTypeBoolean extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */

    public checkType(paramName: string, value: any): void {
        if (value !== 'true' && value !== 'false') {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_10,
                    value: [paramName],
                },
            };
        }
    }
}
