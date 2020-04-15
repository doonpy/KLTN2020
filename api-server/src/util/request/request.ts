import requestPromise, { RequestPromiseOptions } from 'request-promise';
import { Response } from 'request';

export default class Request {
    private readonly options: RequestPromiseOptions = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            Accept: 'text/plain,text/html,*/*',
        },
        timeout: parseInt(process.env.REQUEST_TIMEOUT || '10000', 10),
        resolveWithFullResponse: true,
        time: true,
    };
    private readonly url: string;

    constructor(url: string, options?: object) {
        if (options) {
            this.options = options;
        }
        this.url = url;
    }

    /**
     * Send request
     *
     * @return Promise<Response>
     */
    public async send(): Promise<Response> {
        try {
            return await requestPromise(this.url, this.options);
        } catch (error) {
            throw error;
        }
    }
}
