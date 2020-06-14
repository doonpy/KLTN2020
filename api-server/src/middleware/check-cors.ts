import cors, { CorsOptions } from 'cors';
import ExceptionCustomize from '@util/exception/ExceptionCustomize';
import ResponseStatusCode from '@common/response-status-code';
import { replaceMetaDataString } from '@util/helper/string';
import { getLanguageIndexOfRequest } from '@common/language';
import { Request } from 'express';

const MESSAGE = {
    MSG_ERR_1: ['bị cấm bởi CORS', 'not allowed by CORS'],
};
const CAUSE = {
    CAU_ERR_1: [
        'truy cập %s bị cấm bởi CORS',
        'access to %s not allowed by CORS',
    ],
};

const corsOptionsDelegate = (req: Request, callback: Function): void => {
    const whiteList = process.env.CORS_WHITE_LIST!.split(';');
    const corsOptions: CorsOptions = {
        origin: (
            origin: string | undefined,
            originCallback: Function
        ): void => {
            if (whiteList.indexOf(origin!) !== -1) {
                originCallback(null, true);
            } else {
                const language = getLanguageIndexOfRequest(req);
                const error = new ExceptionCustomize(
                    ResponseStatusCode.FORBIDDEN,
                    replaceMetaDataString(CAUSE.CAU_ERR_1[language], [
                        req.path,
                    ]),
                    MESSAGE.MSG_ERR_1[language]
                );
                originCallback(error);
            }
        },
    };
    callback(null, corsOptions);
};

export default cors(corsOptionsDelegate);
