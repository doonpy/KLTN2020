/**
 * @param value
 * @param format
 * @param delimiter
 */
export const convertStringToDate = (
    value: string,
    format: string,
    delimiter: '/' | '-' | '.' | string
): Date | undefined => {
    format = format.toLowerCase();
    const separatedFormat = format.split(delimiter);
    const separatedValue = value.split(delimiter);
    const dayIndex = separatedFormat.indexOf('dd');
    const monthIndex = separatedFormat.indexOf('mm');
    const yearIndex = separatedFormat.indexOf('yyyy');

    if (!separatedValue[dayIndex] || !Number(!separatedValue[dayIndex])) {
        return undefined;
    }
    if (!separatedValue[monthIndex] || !Number(!separatedValue[monthIndex])) {
        return undefined;
    }
    if (!separatedValue[yearIndex] || !Number(!separatedValue[yearIndex])) {
        return undefined;
    }

    return new Date(
        Number(separatedValue[yearIndex]),
        Number(separatedValue[monthIndex]) - 1,
        Number(separatedValue[dayIndex])
    );
};

/**
 * @param expectTime
 * @param isUtcTime
 *
 * @return boolean
 */
export const isExactTime = (expectTime: Date, isUtcTime = false): boolean => {
    const currentTime = new Date();

    if (!isUtcTime) {
        if (expectTime.getHours() !== currentTime.getHours()) {
            return false;
        }

        if (expectTime.getMinutes() !== currentTime.getMinutes()) {
            return false;
        }

        return expectTime.getSeconds() === currentTime.getSeconds();
    }
    if (expectTime.getUTCHours() !== currentTime.getUTCHours()) {
        return false;
    }

    if (expectTime.getUTCMinutes() !== currentTime.getUTCMinutes()) {
        return false;
    }

    return expectTime.getUTCSeconds() === currentTime.getUTCSeconds();
};

/**
 * Convert seconds to time
 *
 * @param totalSeconds
 *
 * @return string
 */
export const convertTotalSecondsToTime = (totalSeconds: number): string => {
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${days} day(s) - ${hours < 9 ? `0${hours}` : hours}:${minutes < 9 ? `0${minutes}` : minutes}:${
        seconds < 9 ? `0${seconds}` : seconds
    }`;
};
