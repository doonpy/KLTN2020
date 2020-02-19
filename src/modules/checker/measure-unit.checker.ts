import CheckerBase from '../base/checker.base';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { Cause } from '../../util/definition/error/cause';
import { ErrorMessage } from '../../util/definition/error/message';

class MeasureUnitChecker extends CheckerBase {
    private measureUnit: string;

    constructor(measureUnit: string) {
        super();
        this.measureUnit = encodeURI(measureUnit);
    }

    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: object): void {
        let value: any | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (this.measureUnit !== encodeURI(value)) {
            throw new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                ErrorMessage.PARAM.INVALID_VALUE,
                Cause.DATA_VALUE.MEASURE_UNIT,
                [value, decodeURI(this.measureUnit)]
            );
        }
    }
}

export default MeasureUnitChecker;
