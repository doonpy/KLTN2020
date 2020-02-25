import requestPromise from 'request-promise';
import { Constant } from './definition/constant';

const options: object = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    },
    timeout: Constant.REQUEST.TIMEOUT,
};

const sendRequest = (url: string): Promise<any> => {
    return new Promise((resolve: any, reject: any): void => {
        requestPromise(url, options)
            .then((htmlString: string): void => {
                resolve(htmlString);
            })
            .catch((error: Error): void => {
                reject(error);
            });
    });
};

export default sendRequest;
