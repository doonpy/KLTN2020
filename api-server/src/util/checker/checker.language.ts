import CheckerBase from './checker.base';
import CheckerWording from './checker.wording';
import ResponseStatusCode from '../../common/common.response-status.code';
import CommonLanguage from '../../common/common.language';

export default class CheckerLanguage extends CheckerBase {
    /**
     * @param {string} paramName
     * @param {object | string | null} input
     *
     * @return void
     */
    public check(paramName: string, input: { [key: string]: string } | null | string): void {
        const value: string | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        const languageList: string[] = Object.keys(CommonLanguage);
        const index: number = languageList.indexOf(value);

        if (index < 0) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_12, value: [value] },
            };
        }
    }
}
