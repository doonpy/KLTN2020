import CheckerBase from '../base/checker.base';

class ParamValidator {
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

export default ParamValidator;
