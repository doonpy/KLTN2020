export const convertStringToDate = (
    value: string,
    format: string,
    delimiter: '/' | '-' | '.' | string
): Date | undefined => {
    if (!value) {
        return undefined;
    }

    const separatedFormat = format.toLowerCase().split(delimiter);
    const separatedValue = value.split(delimiter);
    const dayIndex = separatedFormat.indexOf('dd');
    const monthIndex = separatedFormat.indexOf('mm');
    const yearIndex = separatedFormat.indexOf('yyyy');

    if (!separatedValue[dayIndex] || !Number(separatedValue[dayIndex])) {
        return undefined;
    }
    if (!separatedValue[monthIndex] || !Number(separatedValue[monthIndex])) {
        return undefined;
    }
    if (!separatedValue[yearIndex] || !Number(separatedValue[yearIndex])) {
        return undefined;
    }

    return new Date(
        Number(separatedValue[yearIndex]),
        Number(separatedValue[monthIndex]) - 1,
        Number(separatedValue[dayIndex])
    );
};

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
 */
export const convertTotalSecondsToTime = (totalSeconds: number): string => {
    let totalSecondsClone = totalSeconds;
    const days = Math.floor(totalSecondsClone / 86400);
    totalSecondsClone %= 86400;
    const hours = Math.floor(totalSecondsClone / 3600);
    totalSecondsClone %= 3600;
    const minutes = Math.floor(totalSecondsClone / 60);
    const seconds = totalSecondsClone % 60;

    return `${days} day(s) - ${hours < 9 ? `0${hours}` : hours}:${
        minutes < 9 ? `0${minutes}` : minutes
    }:${seconds < 9 ? `0${seconds}` : seconds}`;
};
