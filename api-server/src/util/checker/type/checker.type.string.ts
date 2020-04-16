import CheckerTypeBase from './checker.type.base';
import Exception from '../../../services/exception/exception.index';
import CheckerTypeFailedResponse from './checker.type.failed-response';
import ResponseStatusCode from '../../../common/common.response-status.code';

export default class CheckerTypeString extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public checkType(paramName: string, value: any): void {
        if (typeof value !== 'string') {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                CheckerTypeFailedResponse.Message.INVALID_TYPE,
                CheckerTypeFailedResponse.RootCause.STRING,
                [paramName]
            );
        }
    }
}
