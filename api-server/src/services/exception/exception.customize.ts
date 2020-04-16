import StringHandler from '../../util/string-handler/string-handler';

export default class ExceptionCustomize extends Error {
    public readonly statusCode: number;

    public readonly cause: string;

    constructor(statusCode: number, message: string, cause = '', valueCause: (string | number)[] = []) {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.cause = StringHandler.replaceString(cause, valueCause);
    }
}
