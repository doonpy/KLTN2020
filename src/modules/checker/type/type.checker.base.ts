import CheckerBase from '../../base/checker.base';

abstract class TypeCheckerBase extends CheckerBase {
    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: any): void {
        let value: any | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        this.checkType(paramName, value);
    }

    /**
     * @param paramName
     * @param value
     */
    public abstract checkType(paramName: string, value: any): void;
}

export default TypeCheckerBase;
