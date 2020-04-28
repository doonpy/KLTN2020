export default class ExceptionCustomize extends Error {
    public readonly statusCode: number;

    public readonly cause: string;

    public readonly input: (number | string | { [key: string]: string | number })[];

    constructor(
        statusCode: number,
        message: string,
        cause = '',
        input: (number | string | { [key: string]: string | number })[] = []
    ) {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.cause = cause;
        this.input = input;
    }
}
