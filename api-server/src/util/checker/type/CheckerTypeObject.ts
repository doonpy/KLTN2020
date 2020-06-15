import ResponseStatusCode from '@common/response-status-code';
import CheckerTypeBase from './CheckerTypeBase';
import CheckerWording from '../wording';

export default class CheckerTypeObject extends CheckerTypeBase {
    public checkType(paramName: string, value: any): void {
        if (typeof value !== 'object') {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_8,
                    value: [paramName],
                },
            };
        }
    }
}
