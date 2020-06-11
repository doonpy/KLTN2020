import CheckerBase from '../checker/CheckerBase';
import ValidatorParam from './ValidatorParam';

export default class Validator {
    private paramValidators: ValidatorParam[] = [];

    /**
     * @param name
     * @param checker
     */
    public addParamValidator(name: string, checker: CheckerBase): void {
        this.paramValidators.push(new ValidatorParam(name, checker));
    }

    /**
     * @param input
     *
     * @return boolean
     */
    public validate(input: object): void {
        this.paramValidators.forEach((validatorItem) => {
            validatorItem.validate(input);
        });
    }
}
