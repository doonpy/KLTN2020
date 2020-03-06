export default class StringHandler {
    /**
     * @param originalString
     * @param value
     */
    public static replaceString(originalString: string, value: Array<any>): string {
        const REPLACE_SIGN_STRING: string = 's';
        const REPLACE_SIGN_INTEGER: string = 'i';
        const REPLACE_SIGN_JSON: string = 'j';
        const REPLACE_SIGN_RAW: string = 'r';

        let completedCause: string = '';
        let isReplaceSign: boolean = false;

        originalString.split('').forEach((char: string, index: number): void => {
            if (char === '%') {
                isReplaceSign = true;
                return;
            }

            if (isReplaceSign) {
                switch (char) {
                    case REPLACE_SIGN_INTEGER:
                        completedCause += `${Number(value.shift())}`;
                        break;
                    case REPLACE_SIGN_STRING:
                        completedCause += `'${value.shift() || 'null'}'`;
                        break;
                    case REPLACE_SIGN_JSON:
                        completedCause += `${JSON.stringify(value.shift() || {}) || '{}'}`;
                        break;
                    case REPLACE_SIGN_RAW:
                        completedCause += `${value.shift() || ''}`;
                }
                isReplaceSign = false;
            } else {
                completedCause += char;
            }
        });

        return completedCause;
    }

    /**
     * @param rawText
     * @param pattern
     *
     * @return string
     */
    public static cleanText(rawText: string, pattern: RegExp): string {
        return rawText.replace(pattern, '');
    }
}
