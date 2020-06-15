import ResponseStatusCode from '@common/response-status-code';
import CheckerBase from './CheckerBase';
import CheckerWording from './wording';

export default class CheckerMeasureUnit extends CheckerBase {
    private readonly measureUnit: string;

    constructor(measureUnit: string) {
        super();
        this.measureUnit = encodeURI(measureUnit);
    }

    public check(paramName: string, input: object): void {
        const value = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (this.measureUnit !== encodeURI(value)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_5,
                    value: [value, decodeURI(this.measureUnit)],
                },
            };
        }
    }
}
