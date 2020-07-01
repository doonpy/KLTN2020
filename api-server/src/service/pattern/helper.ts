import {
    PatternMainLocator,
    PatternSubLocator,
} from '@service/pattern/interface';
import fs from 'fs';
import { AxiosRequestConfig } from 'axios';
import { sendRequest } from '@util/request';
import {
    addHighlight,
    ToolboxLocator,
} from '@util/cheerio-helper/cheerio-helper';
import { getCryptoFilename } from '@util/file/file';

export const createPatternViewFile = async (
    sourceUrl: string,
    mainLocator: PatternMainLocator,
    subLocator: PatternSubLocator[]
): Promise<void> => {
    const filename = getCryptoFilename(sourceUrl);
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
        url: sourceUrl,
    });
    const toolboxLocators: ToolboxLocator[] = [];
    toolboxLocators.push({
        cssSelector: mainLocator.postDate.locator,
        label: `Ngày đăng\nĐịnh dạng: ${mainLocator.postDate.format}`,
    });
    toolboxLocators.push({ cssSelector: mainLocator.title, label: 'Tiêu đề' });
    toolboxLocators.push({ cssSelector: mainLocator.describe, label: 'Mô tả' });
    toolboxLocators.push({ cssSelector: mainLocator.price, label: 'Giá' });
    toolboxLocators.push({
        cssSelector: mainLocator.acreage,
        label: 'Diện tích',
    });
    toolboxLocators.push({
        cssSelector: mainLocator.address,
        label: 'Địa chỉ',
    });
    toolboxLocators.push({
        cssSelector: mainLocator.propertyType,
        label: 'Loại bất động',
    });
    subLocator.forEach(({ name, value }, index) => {
        toolboxLocators.push({
            cssSelector: name,
            label: `Tên thông tin phụ thứ ${index + 1}`,
        });
        toolboxLocators.push({
            cssSelector: value,
            label: `Giá trị thông tin phụ thứ ${index + 1}`,
        });
    });
    fs.writeFileSync(
        `${reviewFolder}/${filename}`,
        addHighlight(data, toolboxLocators)
    );
};
