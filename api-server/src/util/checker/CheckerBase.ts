export default abstract class CheckerBase {
    public abstract check(paramName: string, input: Record<string, any>): void;

    /**
     * Get value
     */
    public getValue(key: string, input: Record<string, any>): string | null {
        if (!input && !(input as { [key: string]: string })[key]) {
            return null;
        }

        return (input as { [key: string]: string })[key];
    }
}
