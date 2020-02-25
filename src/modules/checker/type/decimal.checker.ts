import TypeCheckerBase from './type.checker.base';
import { Constant } from '../../../util/definition/constant';
import CustomizeException from '../../exception/customize.exception';
import { Cause } from '../../../util/definition/error/cause';
import { ErrorMessage } from '../../../util/definition/error/message';

const DECIMAL_NUMERIC_CHARACTER_PATTERN = new RegExp(/^([1-9]+)?0?\.[0-9]+$/);

class DecimalChecker extends TypeCheckerBase {
    /**
     * @param paramName
     * @param value
     */
    public checkType(paramName: string, value: any): void {
        if (!DECIMAL_NUMERIC_CHARACTER_PATTERN.test(value.toString())) {
            throw new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                ErrorMessage.PARAM.INVALID_TYPE,
                Cause.DATA_TYPE.DECIMAL,
                [paramName]
            );
        }
    }
}

export default DecimalChecker;
