import CheckerTypeBase from './checker.type.base';
import { Exception } from '../../exception/exception.index';
import { Common } from '../../../common/common.index';
import { CheckerTypeFailedResponse } from './checker.type.failed-response';

export default class CheckerTypeBoolean extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    public checkType(paramName: string, value: any): void {
        if (value !== 'true' && value !== 'false') {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                CheckerTypeFailedResponse.Message.INVALID_TYPE,
                CheckerTypeFailedResponse.RootCause.BOOLEAN,
                [paramName]
            );
        }
    }
}
