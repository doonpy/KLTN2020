import CheckerBase from '../checker/CheckerBase';

export default class ValidatorParam {
    private readonly paramName: string;

    private checker: CheckerBase;

    constructor(paramName: string, checker: CheckerBase) {
        this.paramName = paramName;
        this.checker = checker;
    }

    public validate(input: object): void {
        this.checker.check(this.paramName, input);
    }
}
