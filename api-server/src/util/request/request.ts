import requestPromise, {
    RequestPromise,
    RequestPromiseOptions,
} from 'request-promise';
import { Response } from 'request';

/**
 * Send request
 *
 * @return Promise<Response>
 */
export const sendRequest = <T>(
    url: string,
    options: RequestPromiseOptions
): RequestPromise<T> => {
    return requestPromise(url, options);
};
