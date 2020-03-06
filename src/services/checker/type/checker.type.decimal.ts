import CheckerTypeBase from './checker.type.base';
import { Exception } from '../../exception/exception.index';
import { Common } from '../../../common/common.index';
import { CheckerTypeFailedResponse } from './checker.type.failed-response';

const DECIMAL_NUMERIC_CHARACTER_PATTERN = new RegExp(/^([1-9]+)?0?\.[0-9]+$/);

export default class CheckerTypeDecimal extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    public checkType(paramName: string, value: any): void {
        if (!DECIMAL_NUMERIC_CHARACTER_PATTERN.test(value.toString())) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                CheckerTypeFailedResponse.Message.INVALID_TYPE,
                CheckerTypeFailedResponse.RootCause.DECIMAL,
                [paramName]
            );
        }
    }
}
