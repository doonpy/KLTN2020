import CheckerBase from '../checker/checker.base';
import ValidatorParam from './validator.param';

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
    public validate(input: { [key: string]: string } | null | string): void {
        this.paramValidators.forEach((validatorItem) => {
            validatorItem.validate(input);
        });
    }
}
