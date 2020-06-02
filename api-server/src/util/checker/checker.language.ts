import CommonLanguage from '@common/common.language';
import ResponseStatusCode from '@common/common.response-status.code';
import CheckerBase from './checker.base';
import CheckerWording from './checker.wording';

export default class CheckerLanguage extends CheckerBase {
    /**
     * @param {string} paramName
     * @param {object | string | null} input
     *
     * @return void
     */
    public check(paramName: string, input: object): void {
        const value = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        const languageList = Object.keys(CommonLanguage);
        const index = languageList.indexOf(value);

        if (index < 0) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_12, value: [value] },
            };
        }
    }
}
