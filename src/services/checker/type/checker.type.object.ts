import CheckerTypeBase from './checker.type.base';
import { Exception } from '../../exception/exception.index';
import { Common } from '../../../common/common.index';
import { CheckerTypeFailedResponse } from './checker.type.failed-response';

export default class CheckerTypeObject extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    public checkType(paramName: string, value: any): void {
        if (typeof value !== 'object') {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                CheckerTypeFailedResponse.Message.INVALID_TYPE,
                CheckerTypeFailedResponse.RootCause.OBJECT,
                [paramName]
            );
        }
    }
}
