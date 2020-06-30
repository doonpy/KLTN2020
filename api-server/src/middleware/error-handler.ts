import { NextFunction, Request, Response } from 'express-serve-static-core';
import ResponseStatusCode from '@common/response-status-code';
import ExceptionCustomize from '@util/exception/ExceptionCustomize';
import {
    replaceMetaDataString,
    upperCaseFirstCharacter,
} from '@util/helper/string';

const MESSAGE = {
    MSG_ERR_1: 'specify path does not exist',
};
const CAUSE = {
    CAU_ERR_1: '%s does not exits',
    CAU_ERR_2: 'unknown error',
};

interface ErrorResponseBody {
    error: {
        cause: string;
        message: string;
        input: string;
        stack?: string;
    };
    statusCode: number;
}

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
            index++;
            continue;
        }

        for (const key of keys) {
            const value = item[key];

            if (!value) {
                inputString.push(`'${key}' => '${value}'`);
                continue;
            }

            if (typeof value === 'object') {
                if (Array.isArray(value)) {
                    inputString.push(`'${key}' => {${convertToString(value)}}`);
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
    next(
        new ExceptionCustomize(
            ResponseStatusCode.NOT_FOUND,
            MESSAGE.MSG_ERR_1,
            replaceMetaDataString(CAUSE.CAU_ERR_1, [req.path])
        )
    );
};

/**
 * Error handler
 */
export const errorHandler = (
    { statusCode, message, cause, stack }: ExceptionCustomize,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let body: ErrorResponseBody;
    if (process.env.NODE_ENV === 'production') {
        body = {
            error: {
                cause: upperCaseFirstCharacter(cause || CAUSE.CAU_ERR_2),
                message: upperCaseFirstCharacter(message),
                input: convertToString([req.params, req.query, req.body]),
            },
            statusCode: statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
        };
    } else {
        body = {
            error: {
                cause: upperCaseFirstCharacter(cause || CAUSE.CAU_ERR_2),
                message: upperCaseFirstCharacter(message),
                input: convertToString([req.params, req.query, req.body]),
                stack,
            },
            statusCode: statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
        };
    }
    res.status(ResponseStatusCode.OK).json(body);
};
