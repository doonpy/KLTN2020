import { createHmac } from 'crypto';

export const getCryptoFilename = (filename: string): string => {
    return createHmac('md5', 'pk2020').update(filename).digest('hex') + '.html';
};
