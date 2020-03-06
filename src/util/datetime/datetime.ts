enum DateTimeDelimiter {
    slash = '/',
    dash = '_',
    hyphen = '-',
    dot = '.',
}
export default class DateTime extends Date {
    constructor() {
        super();
    }

    /**
     * @param value
     * @param format
     * @param delimiter
     */
    public static convertStringToDate(
        value: string,
        format: string,
        delimiter: DateTimeDelimiter
    ): Date {
        format = format.toLowerCase();
        let separatedFormat: Array<string> = format.split(delimiter);
        let separatedValue: Array<string> = value.split(delimiter);
        let dayIndex: number = separatedFormat.indexOf('dd');
        let monthIndex: number = separatedFormat.indexOf('mm');
        let yearIndex: number = separatedFormat.indexOf('yyyy');

        return new Date(
            parseInt(separatedValue[yearIndex]),
            parseInt(separatedValue[monthIndex]) - 1,
            parseInt(separatedValue[dayIndex])
        );
    }

    /**
     * @param expectTime
     *
     * @return boolean
     */
    public static isExactTime(expectTime: Date): boolean {
        let currentTime: Date = new Date();

        if (expectTime.getHours() !== currentTime.getHours()) {
            return false;
        }

        if (expectTime.getMinutes() !== currentTime.getMinutes()) {
            return false;
        }

        return expectTime.getSeconds() === currentTime.getSeconds();
    }
}
