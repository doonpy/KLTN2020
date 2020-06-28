import fs from 'fs';
import { AxiosRequestConfig } from 'axios';
import { sendRequest } from '@util/request';
import {
    addHighlight,
    ToolboxLocator,
} from '@util/cheerio-helper/cheerio-helper';
import { getCryptoFilename } from '@util/file/file';

export const createCatalogViewFile = async (
    url: string,
    pageNumberLocator: string,
    detailUrlLocator: string
): Promise<void> => {
    const filename = getCryptoFilename(url);
    const reviewFolder = process.env.REVIEW_FOLDER!;
    const DEFAULT_REQUEST_OPTIONS: AxiosRequestConfig = {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            Accept: 'text/plain,text/html,*/*',
        },
    };
    const { data } = await sendRequest<string>({
        ...DEFAULT_REQUEST_OPTIONS,
        url: url,
    });
    const toolboxLocators: ToolboxLocator[] = [];
    toolboxLocators.push({
        cssSelector: pageNumberLocator,
        label: 'Đường dẫn phân trang',
    });
    toolboxLocators.push({
        cssSelector: detailUrlLocator,
        label: 'Đường dẫn trang chi tiết',
    });

    fs.writeFileSync(
        `${reviewFolder}/${filename}`,
        addHighlight(data, toolboxLocators)
    );
};
