import CheckerBase from './checker.base';
import CheckerWording from './checker.wording';
import ResponseStatusCode from '@common/common.response-status.code';

export default class CheckerDomain extends CheckerBase {
    private VALID_DOMAIN = new RegExp(/^(https?:\/\/)(?:www\.)?([\d\w-]+)(\.([\d\w-]+))+$/);

    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: object): void {
        const value: string | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (!this.VALID_DOMAIN.test(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_1, value: [value] },
            };
        }
    }
}
