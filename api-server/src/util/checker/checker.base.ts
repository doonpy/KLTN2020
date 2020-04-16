export default abstract class CheckerBase {
    /**
     * @param paramName
     * @param input
     */
    public abstract check(paramName: string, input: { [key: string]: string } | null | string): void;

    /**
     * Get value
     *
     * @param key
     * @param input
     *
     * @return any | null
     */
    public getValue(key: string, input: { [key: string]: string } | null | string): string | null {
        if (key === '') {
            return input as string;
        }
        if (!(input as { [key: string]: string })[key]) {
            return null;
        }

        return (input as { [key: string]: string })[key];
    }
}
