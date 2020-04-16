import CheckerTypeBase from './checker.type.base';
import Exception from '../../../services/exception/exception.index';
import CheckerTypeFailedResponse from './checker.type.failed-response';
import ResponseStatusCode from '../../../common/common.response-status.code';

const NUMERIC_CHARACTER_PATTERN = new RegExp(/^-?\d+$/);

export default class CheckerTypeInteger extends CheckerTypeBase {
    /**
     * @param paramName
     * @param value
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public checkType(paramName: string, value: any): void {
        if (!NUMERIC_CHARACTER_PATTERN.test(value) || !Number.isInteger(Number(value))) {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                CheckerTypeFailedResponse.Message.INVALID_TYPE,
                CheckerTypeFailedResponse.RootCause.INTEGER,
                [paramName]
            );
        }
    }
}
