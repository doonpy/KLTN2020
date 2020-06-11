import ResponseStatusCode from '@common/response-status-code';
import CheckerTypeBase from './CheckerTypeBase';
import CheckerWording from '../wording';

export default class CheckerTypeString extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */

    public checkType(paramName: string, value: any): void {
        if (typeof value !== 'string') {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_9,
                    value: [paramName],
                },
            };
        }
    }
}
