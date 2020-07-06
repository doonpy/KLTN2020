import fs from 'fs';
import {
    addHighlight,
    ToolboxLocator,
} from '@util/cheerio-helper/cheerio-helper';
import { getCryptoFilename } from '@util/file/file';
import { getContent } from '@util/request';

export const createCatalogViewFile = async (
    url: string,
    pageNumberLocator: string,
    detailUrlLocator: string
): Promise<void> => {
    const filename = getCryptoFilename(url);
    const reviewFolder = process.env.REVIEW_FOLDER!;
    const content = await getContent(url);
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
        addHighlight(content, toolboxLocators)
    );
};
