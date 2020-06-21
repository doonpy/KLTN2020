import CheckerBase from '../checker/CheckerBase';

export default class ValidatorParam {
    private readonly paramName: string;

    private checker: CheckerBase;

    constructor(paramName: string, checker: CheckerBase) {
        this.paramName = paramName;
        this.checker = checker;
    }

    public validate(input: Record<string, any>): void {
        this.checker.check(this.paramName, input);
    }
}
