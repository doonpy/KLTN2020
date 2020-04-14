import CheckerTypeBase from './checker.type.base';
import { Exception } from '../../exception/exception.index';
import { Common } from '../../../common/common.index';
import { CheckerTypeFailedResponse } from './checker.type.failed-response';

const NUMERIC_CHARACTER_PATTERN = new RegExp(/^\-?\d+$/);

export default class CheckerTypeInteger extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    public checkType(paramName: string, value: any): void {
        if (!NUMERIC_CHARACTER_PATTERN.test(value) || !Number.isInteger(Number(value))) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                CheckerTypeFailedResponse.Message.INVALID_TYPE,
                CheckerTypeFailedResponse.RootCause.INTEGER,
                [paramName]
            );
        }
    }
}
