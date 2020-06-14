import { NextFunction, Request, Response } from 'express';
import ResponseStatusCode from '@common/response-status-code';
import ExceptionCustomize from '@util/exception/ExceptionCustomize';
import {
    replaceMetaDataString,
    upperCaseFirstCharacter,
} from '@util/helper/string';
import { getLanguageIndexOfRequest } from '@common/language';

const MESSAGE = {
    MSG_ERR_1: ['đường dẫn không tồn tại', 'specify path does not exist'],
};
const CAUSE = {
    CAU_ERR_1: ['%s không tồn tại', '%s does not exits'],
    CAU_ERR_2: ['lỗi không xác định', 'unknown error'],
};

const convertToString = (
    input: Array<{ [key: string]: string | number }>
): string => {
    const inputString: string[] = [];

    if (!input || input.length === 0) {
        return '';
    }

    let index = 0;
    for (const item of input) {
        const keys = Object.keys(item);

        if (keys.length === 0) {
            continue;
        }

        if (typeof item !== 'object') {
            inputString.push(`'${index}' => '${item}'`);
        } else {
            for (const key of keys) {
                const value = item[key];

                if (!value) {
                    inputString.push(`'${key}' => '${value}'`);
                    continue;
                }

                if (typeof value === 'object') {
                    if (Array.isArray(value)) {
                        inputString.push(
                            `'${key}' => {${convertToString(value)}}`
                        );
                    } else {
                        inputString.push(
                            `'${key}' => {${convertToString([value])}}`
                        );
                    }
                    continue;
                }

                inputString.push(`'${key}' => '${value}'`);
            }
        }
        index++;
    }

    return inputString.join(', ');
};

/**
 * Catch 404 and forward to error handler
 */
export const notFoundRoute = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const language = getLanguageIndexOfRequest(req);
    next(
        new ExceptionCustomize(
            ResponseStatusCode.NOT_FOUND,
            replaceMetaDataString(CAUSE.CAU_ERR_1[language], [req.path]),
            MESSAGE.MSG_ERR_1[language]
        )
    );
};

/**
 * Error handler
 */
export const errorHandler = (
    { statusCode, message, cause, stack, input }: ExceptionCustomize,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let body = {};
    const language = getLanguageIndexOfRequest(req);
    if (process.env.NODE_ENV === 'production') {
        body = {
            error: {
                cause: upperCaseFirstCharacter(
                    cause || CAUSE.CAU_ERR_2[language]
                ),
                message: upperCaseFirstCharacter(message),
                input: convertToString(
                    input as Array<{ [key: string]: string | number }>
                ),
            },
        };
    } else {
        body = {
            error: {
                cause: upperCaseFirstCharacter(
                    cause || CAUSE.CAU_ERR_2[language]
                ),
                message: upperCaseFirstCharacter(message),
                input: convertToString(
                    input as Array<{ [key: string]: string | number }>
                ),
                stack,
            },
        };
    }

    if (statusCode === ResponseStatusCode.NO_CONTENT) {
        res.status(statusCode).json();
    } else {
        res.status(statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR).json(
            body
        );
    }
};
