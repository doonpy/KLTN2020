import CheckerBase from './checker.base';
import { Exception } from '../exception/exception.index';
import { Common } from '../../common/common.index';
import { CheckerFailedResponse } from './checker.failed-response';

export default class CheckerUrl extends CheckerBase {
    private VALID_URL: RegExp = new RegExp(
        /^(https?:\/\/)(?:www\.)?([\d\w\-]+)(\.[\d\w\-]+)+\/(([\d\w\-]+)+\/?)+/
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

        if (!this.VALID_URL.test(value)) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                CheckerFailedResponse.Message.INVALID_VALUE,
                CheckerFailedResponse.RootCause.URL,
                [value]
            );
        }
    }
}
