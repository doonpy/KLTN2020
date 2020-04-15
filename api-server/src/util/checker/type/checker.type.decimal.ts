import CheckerTypeBase from './checker.type.base';
import { Exception } from '../../../services/exception/exception.index';
import { CheckerTypeFailedResponse } from './checker.type.failed-response';
import { ResponseStatusCode } from '../../../common/common.response-status.code';

const DECIMAL_NUMERIC_CHARACTER_PATTERN = new RegExp(/(^([1-9]+)?0?\.[0-9]+$)|\d/);

export default class CheckerTypeDecimal extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    public checkType(paramName: string, value: any): void {
        if (!DECIMAL_NUMERIC_CHARACTER_PATTERN.test(value.toString())) {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                CheckerTypeFailedResponse.Message.INVALID_TYPE,
                CheckerTypeFailedResponse.RootCause.DECIMAL,
                [paramName]
            );
        }
    }
}
