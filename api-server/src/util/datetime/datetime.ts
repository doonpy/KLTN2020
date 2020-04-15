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
    public static convertStringToDate(value: string, format: string, delimiter: DateTimeDelimiter): Date {
        format = format.toLowerCase();
        const separatedFormat: string[] = format.split(delimiter);
        const separatedValue: string[] = value.split(delimiter);
        const dayIndex: number = separatedFormat.indexOf('dd');
        const monthIndex: number = separatedFormat.indexOf('mm');
        const yearIndex: number = separatedFormat.indexOf('yyyy');

        return new Date(
            parseInt(separatedValue[yearIndex], 10),
            parseInt(separatedValue[monthIndex], 10) - 1,
            parseInt(separatedValue[dayIndex], 10)
        );
    }

    /**
     * @param expectTime
     * @param isUtcTime
     *
     * @return boolean
     */
    public static isExactTime(expectTime: Date, isUtcTime: boolean = false): boolean {
        const currentTime: Date = new Date();

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
        const days: number = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours: number = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes: number = Math.floor(totalSeconds / 60);
        const seconds: number = totalSeconds % 60;

        return `${days} days ${hours < 9 ? `0${hours}` : hours}:${minutes < 9 ? `0${minutes}` : minutes}:${
            seconds < 9 ? `0${seconds}` : seconds
        }`;
    }
}
