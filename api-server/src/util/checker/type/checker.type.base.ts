import CheckerBase from '../checker.base';

export default abstract class CheckerTypeBase extends CheckerBase {
    /**
     * @param paramName
     * @param input
     */
    public check(paramName: string, input: { [key: string]: string } | null | string): void {
        const value: string | null = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        this.checkType(paramName, value);
    }

    /**
     * @param paramName
     * @param value
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public abstract checkType(paramName: string, value: any): void;
}
