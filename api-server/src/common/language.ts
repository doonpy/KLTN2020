import { Request } from 'express';

export const CommonLanguageIndex: { [key: string]: number } = {
    vi: 0,
    en: 1,
};

export const getLanguageIndexOfRequest = (req: Request): number => {
    return req.path.includes('/vi/')
        ? CommonLanguageIndex.vi
        : CommonLanguageIndex.en;
};
