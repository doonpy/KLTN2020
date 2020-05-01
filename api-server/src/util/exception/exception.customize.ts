export default class ExceptionCustomize extends Error {
    public readonly statusCode: number;

    public readonly cause: string;

    public readonly input: (number | string | object)[];

    constructor(statusCode: number, cause = '', message: string, input: (number | string | object)[] = []) {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.cause = cause;
        this.input = input;
    }
}
