const REPLACE_SIGN_STRING: string = 's';
const REPLACE_SIGN_INTEGER: string = 'i';
const REPLACE_SIGN_JSON: string = 'j';

/**
 * @param originalString
 * @param value
 */
export const replaceString = (originalString: string, value: Array<any>): string => {
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
            }
            isReplaceSign = false;
        } else {
            completedCause += char;
        }
    });

    return completedCause;
};
