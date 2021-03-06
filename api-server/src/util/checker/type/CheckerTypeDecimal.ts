import ResponseStatusCode from '@common/response-status-code';
import CheckerTypeBase from './CheckerTypeBase';
import CheckerWording from '../wording';

export default class CheckerTypeDecimal extends CheckerTypeBase {
    public checkType(paramName: string, value: any): void {
        if (!Number(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_7,
                    value: [paramName],
                },
            };
        }
    }
}
