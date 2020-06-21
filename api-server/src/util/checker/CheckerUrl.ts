import ResponseStatusCode from '@common/response-status-code';
import CheckerBase from './CheckerBase';
import CheckerWording from './wording';

export default class CheckerUrl extends CheckerBase {
    private VALID_URL = RegExp(
        /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/
    );

    public check(paramName: string, input: Record<string, any>): void {
        const value = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (!this.VALID_URL.test(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_2,
                    value: [value],
                },
            };
        }
    }
}
