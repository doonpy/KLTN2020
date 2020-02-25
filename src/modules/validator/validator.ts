import CheckerBase from '../base/checker.base';
import ParamValidator from './param.validator';

class Validator {
    private paramValidators: Array<ParamValidator> = [];

    /**
     * @param name
     * @param checker
     */
    public addParamValidator(name: string, checker: CheckerBase): void {
        this.paramValidators.push(new ParamValidator(name, checker));
    }

    /**
     * @param input
     *
     * @return boolean
     */
    public validate(input: object): void {
        this.paramValidators.forEach(validatorItem => {
            validatorItem.validate(input);
        });
    }
}

export default Validator;
