export default abstract class CheckerBase {
    public abstract check(paramName: string, input: object): void;

    /**
     * Get value
     */
    public getValue(key: string, input: object): string | null {
        if (!input && !(input as { [key: string]: string })[key]) {
            return null;
        }

        return (input as { [key: string]: string })[key];
    }
}
