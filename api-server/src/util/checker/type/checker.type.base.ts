import CheckerBase from '../checker.base';

export default abstract class CheckerTypeBase extends CheckerBase {
    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: object): void {
        const value = this.getValue(paramName, input);

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
