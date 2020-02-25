import { replaceString } from '../../util/replace-message';

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
        this._cause = replaceString(cause, valueCause);
    }

    /**
     * Throw error
     */
    public raise(): void {
        throw this;
    }
}

export default CustomizeException;
