import ResponseStatusCode from '@common/common.response-status.code';
import CheckerBase from './checker.base';
import CheckerWording from './checker.wording';

export default class CheckerUrl extends CheckerBase {
    private VALID_URL = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/);

    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: object): void {
        const value: string | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (!this.VALID_URL.test(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_2, value: [value] },
            };
        }
    }
}
