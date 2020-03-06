import StringHandler from '../../util/string-handler/string-handler';

export default class ExceptionApi extends Error {
    public readonly statusCode: number;
    public readonly cause: string;

    constructor(
        statusCode: number,
        message: string,
        cause: string = '',
        valueCause: Array<any> = []
    ) {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.cause = StringHandler.replaceString(cause, valueCause);
    }

    /**
     * Throw error
     */
    public raise(): void {
        throw this;
    }
}
