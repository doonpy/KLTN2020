export default abstract class CheckerBase {
    /**
     * @param paramName
     * @param input
     */
    public abstract check(paramName: string, input: object): void;

    /**
     * Get value
     *
     * @param key
     * @param input
     *
     * @return any | null
     */
    public getValue(key: string, input: object): string | null {
        if (!input && !(input as { [key: string]: string })[key]) {
            return null;
        }

        return (input as { [key: string]: string })[key];
    }
}
