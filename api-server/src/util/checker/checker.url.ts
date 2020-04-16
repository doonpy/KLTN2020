import CheckerBase from './checker.base';
import Exception from '../../services/exception/exception.index';
import CheckerFailedResponse from './checker.failed-response';
import ResponseStatusCode from '../../common/common.response-status.code';

export default class CheckerUrl extends CheckerBase {
    private VALID_URL = new RegExp(/^(https?:\/\/)(?:www\.)?([\d\w-]+)(\.[\d\w-]+)+\/(([\d\w-]+)+\/?)+/);

    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: { [key: string]: string } | null | string): void {
        const value: string | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (!this.VALID_URL.test(value)) {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                CheckerFailedResponse.Message.INVALID_VALUE,
                CheckerFailedResponse.RootCause.URL,
                [value]
            );
        }
    }
}
