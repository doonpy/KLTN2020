import { Exception } from '../../exception/exception.index';
import CheckerTypeBase from './checker.type.base';
import { Common } from '../../../common/common.index';
import { CheckerTypeFailedResponse } from './checker.type.failed-response';

export default class CheckerTypeArray extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    public checkType(paramName: string, value: any): void {
        if (!Array.isArray(value)) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                CheckerTypeFailedResponse.Message.INVALID_TYPE,
                CheckerTypeFailedResponse.RootCause.ARRAY,
                [paramName]
            );
        }
    }
}
