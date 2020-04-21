import CheckerBase from './checker.base';
import CheckerWording from './checker.wording';
import ExceptionCustomize from '../exception/exception.customize';

import ResponseStatusCode from '../../common/common.response-status.code';
import StringHandler from '../string-handler/string-handler';

export default class CheckerMeasureUnit extends CheckerBase {
    private readonly measureUnit: string;

    constructor(measureUnit: string) {
        super();
        this.measureUnit = encodeURI(measureUnit);
    }

    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: { [key: string]: string } | null | string): void {
        const value: string | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (this.measureUnit !== encodeURI(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: { wording: CheckerWording.MESSAGE.MSG_CHK_5, value: [value, decodeURI(this.measureUnit)] },
            };
        }
    }
}
