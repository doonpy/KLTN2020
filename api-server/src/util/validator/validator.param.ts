import CheckerBase from '../checker/checker.base';

export default class ValidatorParam {
    private readonly paramName: string;

    private checker: CheckerBase;

    constructor(paramName: string, checker: CheckerBase) {
        this.paramName = paramName;
        this.checker = checker;
    }

    /**
     * @param input
     *
     * @return boolean
     */
    public validate(input: object): void {
        this.checker.check(this.paramName, input);
    }
}
