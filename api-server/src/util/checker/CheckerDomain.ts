import ResponseStatusCode from '@common/response-status-code';
import CheckerBase from './CheckerBase';
import CheckerWording from './wording';

export default class CheckerDomain extends CheckerBase {
    private VALID_DOMAIN = RegExp(
        /^(https?:\/\/)(?:www\.)?([\d\w-]+)(\.([\d\w-]+))+$/
    );

    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: object): void {
        const value = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (!this.VALID_DOMAIN.test(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_1,
                    value: [value],
                },
            };
        }
    }
}
