import TypeCheckerBase from './type.checker.base';
import { Constant } from '../../../util/definition/constant';
import CustomizeException from '../../exception/customize.exception';
import { Cause } from '../../../util/definition/error/cause';
import { ErrorMessage } from '../../../util/definition/error/message';

class StringChecker extends TypeCheckerBase {
    /**
     * @param paramName
     * @param value
     */
    public checkType(paramName: string, value: any): void {
        if (typeof value !== 'string') {
            throw new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                ErrorMessage.PARAM.INVALID_TYPE,
                Cause.DATA_TYPE.STRING,
                [paramName]
            );
        }
    }
}

export default StringChecker;