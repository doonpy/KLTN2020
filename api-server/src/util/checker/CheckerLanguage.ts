import { CommonLanguageIndex } from '@common/language';
import ResponseStatusCode from '@common/response-status-code';
import CheckerBase from './CheckerBase';
import CheckerWording from './wording';

export default class CheckerLanguage extends CheckerBase {
    public check(paramName: string, input: Record<string, any>): void {
        const value = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        const languageList = Object.keys(CommonLanguageIndex);
        const index = languageList.indexOf(value);

        if (index < 0) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_12,
                    value: [value],
                },
            };
        }
    }
}
