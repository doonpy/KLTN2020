import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import puppeteer from 'puppeteer';

/**
 * Send request
 */
export const sendRequest = async <ResponseDataType>(
    configs: AxiosRequestConfig
): Promise<AxiosResponse<ResponseDataType>> => {
    return axios.request<ResponseDataType>(configs);
};

/**
 * Get content
 */
export const getContent = async (url: string): Promise<string> => {
    const DEFAULT_USER_AGENT =
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(DEFAULT_USER_AGENT);
    await page.goto(url);
    const content = await page.content();
    await browser.close();

    return content;
};
