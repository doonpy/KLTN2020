import { Exception } from '../../services/exception/exception.index';
import CheckerBase from './checker.base';
import { CheckerFailedResponse } from './checker.failed-response';
import { ResponseStatusCode } from '../../common/common.response-status.code';

export default class CheckerDomain extends CheckerBase {
    private VALID_DOMAIN: RegExp = new RegExp(/^(https?:\/\/)(?:www\.)?([\d\w\-]+)(\.([\d\w\-]+))+$/);

    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: object): void {
        const value: any | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (!this.VALID_DOMAIN.test(value)) {
            throw new Exception.Customize(
                ResponseStatusCode.BAD_REQUEST,
                CheckerFailedResponse.Message.INVALID_VALUE,
                CheckerFailedResponse.RootCause.DOMAIN,
                [value]
            );
        }
    }
}
