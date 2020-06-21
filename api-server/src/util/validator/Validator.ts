import CheckerBase from '../checker/CheckerBase';
import ValidatorParam from './ValidatorParam';

export default class Validator {
    private paramValidators: ValidatorParam[] = [];

    public addParamValidator(name: string, checker: CheckerBase): void {
        this.paramValidators.push(new ValidatorParam(name, checker));
    }

    public validate(input: Record<string, any>): void {
        this.paramValidators.forEach((validatorItem) => {
            validatorItem.validate(input);
        });
    }
}
