export default class ExceptionCustomize extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly cause: string = '',
        message: string
    ) {
        super(message);
    }
}
