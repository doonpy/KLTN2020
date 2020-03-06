import { Exception } from '../exception/exception.index';
import CheckerBase from './checker.base';
import { Common } from '../../common/common.index';
import { CheckerFailedResponse } from './checker.failed-response';

export default class CheckerDomain extends CheckerBase {
    private VALID_DOMAIN: RegExp = new RegExp(
        /^(https?:\/\/)(?:www\.)?([\d\w\-]+)(\.[\d\w\-]+)+\/?/
    );

    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: object): void {
        let value: any | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (!this.VALID_DOMAIN.test(value)) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                CheckerFailedResponse.Message.INVALID_VALUE,
                CheckerFailedResponse.RootCause.DOMAIN,
                [value]
            );
        }
    }
}
