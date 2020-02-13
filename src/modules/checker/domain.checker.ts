import CheckerBase from '../base/checker.base';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { Cause } from '../../util/definition/error/cause';
import { ErrorMessage } from '../../util/definition/error/message';

class DomainChecker extends CheckerBase {
    private VALID_DOMAIN: RegExp = new RegExp(
        /^(https?:\/\/)(?:www\.)?([\d\w\-]+)(\.[\d\w\-]+)+\/?/
    );

    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: object): void {
        let value: any | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (!this.VALID_DOMAIN.test(value)) {
            throw new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                ErrorMessage.PARAM.INVALID_VALUE,
                Cause.DATA_VALUE.DOMAIN,
                [value]
            );
        }
    }
}

export default DomainChecker;
