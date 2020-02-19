import requestPromise from 'request-promise';
import cheerio from 'cheerio';

const options: object = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    },
    timeout: 1000,
    transform: (body: string): CheerioStatic => {
        return cheerio.load(body);
    },
};

const sendRequest = (url: string): Promise<any> => {
    return new Promise((resolve: any, reject: any): void => {
        requestPromise(url, options)
            .then(($: CheerioStatic): void => {
                resolve($.root().html());
            })
            .catch((error: Error): void => {
                reject(error);
            });
    });
};

export default sendRequest;
