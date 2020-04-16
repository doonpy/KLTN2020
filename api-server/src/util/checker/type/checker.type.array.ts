import CheckerTypeBase from './checker.type.base';
import CheckerTypeFailedResponse from './checker.type.failed-response';
import ResponseStatusCode from '../../../common/common.response-status.code';
import Exception from '../../../services/exception/exception.index';

export default class CheckerTypeArray extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public checkType(paramName: string, value: any): void {
        if (!Array.isArray(value)) {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                CheckerTypeFailedResponse.Message.INVALID_TYPE,
                CheckerTypeFailedResponse.RootCause.ARRAY,
                [paramName]
            );
        }
    }
}
