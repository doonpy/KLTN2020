export const convertStringToDate = (
    value: string,
    format: string
): Date | undefined => {
    if (!value) {
        return undefined;
    }
    let day = '';
    let month = '';
    let year = '';

    format.split('').forEach((metaData, index) => {
        switch (metaData) {
            case 'd':
                day += value[index];
                break;
            case 'm':
                month += value[index];
                break;
            case 'y':
                year += value[index];
                break;
        }
    });

    if (!day || !month || !year) {
        return undefined;
    }

    return new Date(Number(year), Number(month) - 1, Number(day));
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
