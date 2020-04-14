import CheckerTypeBase from './checker.type.base';
import { Exception } from '../../../services/exception/exception.index';
import { CheckerTypeFailedResponse } from './checker.type.failed-response';
import { ResponseStatusCode } from '../../../common/common.response-status.code';

export default class CheckerTypeObject extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    public checkType(paramName: string, value: any): void {
        if (typeof value !== 'object') {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                CheckerTypeFailedResponse.Message.INVALID_TYPE,
                CheckerTypeFailedResponse.RootCause.OBJECT,
                [paramName]
            );
        }
    }
}
