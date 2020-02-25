abstract class CheckerBase {
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
    public getValue(key: string, input: any): any | null {
        if (key === '') {
            return input;
        }
        if (!input[key]) {
            return null;
        }

        return input[key];
    }
}

export default CheckerBase;
