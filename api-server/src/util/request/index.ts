import requestPromise, {
    RequestPromise,
    RequestPromiseOptions,
} from 'request-promise';

/**
 * Send request
 */
export const sendRequest = <T>(
    url: string,
    options: RequestPromiseOptions
): RequestPromise<T> => {
    return requestPromise(url, options);
};
