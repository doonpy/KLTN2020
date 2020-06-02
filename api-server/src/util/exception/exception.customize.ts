export default class ExceptionCustomize extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly cause: string = '',
        message: string,
        public readonly input: any[] = []
    ) {
        super(message);
    }
}
