const REPLACE_SIGN_STRING: string = 's';
const REPLACE_SIGN_INTEGER: string = 'i';
const REPLACE_SIGN_JSON: string = 'j';

class CustomizeException extends Error {
    private readonly _statusCode: number;
    private readonly _cause: string;

    /**
     * @return statusCode number
     */
    get statusCode(): number {
        return this._statusCode;
    }

    /**
     * @return cause string
     */
    get cause(): string {
        return this._cause;
    }

    constructor(
        statusCode: number,
        message: string,
        cause: string = '',
        valueCause: Array<any> = []
    ) {
        super();
        this._statusCode = statusCode;
        this.message = message;
        this._cause = CustomizeException.handleRootCause(cause, valueCause);
    }

    private static handleRootCause(
        originalCause: string,
        valueCause: Array<any>
    ): string {
        let completedCause: string = '';
        let isReplaceSign: boolean = false;

        originalCause.split('').forEach((char: string, index: number): void => {
            if (char === '%') {
                isReplaceSign = true;
                return;
            }

            if (isReplaceSign) {
                switch (char) {
                    case REPLACE_SIGN_INTEGER:
                        completedCause += `${Number(valueCause.shift())}`;
                        break;
                    case REPLACE_SIGN_STRING:
                        completedCause += `'${valueCause.shift() || 'null'}'`;
                        break;
                    case REPLACE_SIGN_JSON:
                        completedCause += `${JSON.stringify(
                            valueCause.shift() || {}
                        ) || '{}'}`;
                        break;
                }
                isReplaceSign = false;
            } else {
                completedCause += char;
            }
        });

        return completedCause;
    }
}

export default CustomizeException;
