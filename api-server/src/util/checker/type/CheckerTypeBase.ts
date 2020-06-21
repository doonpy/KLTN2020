import CheckerBase from '../CheckerBase';

export default abstract class CheckerTypeBase extends CheckerBase {
    public check(paramName: string, input: Record<string, any>): void {
        const value = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        this.checkType(paramName, value);
    }

    public abstract checkType(paramName: string, value: any): void;
}
