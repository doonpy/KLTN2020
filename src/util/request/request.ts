import requestPromise from 'request-promise';
import { Response } from 'request';

export default class Request {
    private readonly options: object = {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            Accept: 'text/plain,text/html,*/*',
        },
        timeout: parseInt(process.env.REQUEST_TIMEOUT || '10000'),
        resolveWithFullResponse: true,
        time: true,
    };
    private readonly url: string = '';

    constructor(url: string) {
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
