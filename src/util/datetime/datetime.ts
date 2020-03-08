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
    public static isExactTime(expectTime: Date, isUtcTime: boolean = false): boolean {
        let currentTime: Date = new Date();

        if (!isUtcTime) {
            if (expectTime.getHours() !== currentTime.getHours()) {
                return false;
            }

            if (expectTime.getMinutes() !== currentTime.getMinutes()) {
                return false;
            }

            return expectTime.getSeconds() === currentTime.getSeconds();
        } else {
            if (expectTime.getUTCHours() !== currentTime.getUTCHours()) {
                return false;
            }

            if (expectTime.getUTCMinutes() !== currentTime.getUTCMinutes()) {
                return false;
            }

            return expectTime.getUTCSeconds() === currentTime.getUTCSeconds();
        }
    }

    /**
     * Convert seconds to time
     *
     * @param totalSeconds
     *
     * @return string
     */
    public static convertTotalSecondsToTime(totalSeconds: number): string {
        let days: number = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours: number = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes: number = Math.floor(totalSeconds / 60);
        let seconds: number = totalSeconds % 60;

        return `${days} days ${hours < 9 ? `0${hours}` : hours}:${
            minutes < 9 ? `0${minutes}` : minutes
        }:${seconds < 9 ? `0${seconds}` : seconds}`;
    }
}
