import { NextFunction, Request, Response } from 'express';
import ResponseStatusCode from '../../common/common.response-status.code';
import ExceptionCustomize from '../../util/exception/exception.customize';
import ErrorHandlerWording from './error-handler.wording';
import StringHandler from '../../util/string-handler/string-handler';
import CommonLanguage from '../../common/common.language';

/**
 * @param input
 *
 * @return {string} inputString
 */
const convertToString = (input: { [key: string]: string | number }[]): string => {
    const inputString: string[] = [];

    if (input.length === 0) {
        return '';
    }

    for (const item of input) {
        const keys: string[] = Object.keys(item);

        if (keys.length === 0) {
            continue;
        }

        for (const key of keys) {
            const value: string | number = item[key];

            if (typeof value === 'object') {
                inputString.push(`'${key}' => {${convertToString(value)}}`);
            } else {
                inputString.push(`'${key}' => '${value}'`);
            }
        }
    }

    return inputString.join(', ');
};

/**
 * Catch 404 and forward to error handler
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @return {void}
 */
export const notFoundRoute = (req: Request, res: Response, next: NextFunction): void => {
    next(
        new ExceptionCustomize(
            ResponseStatusCode.MSG_CHK_5,
            ErrorHandlerWording.MESSAGE.MSG_CHK_TYPE_1[CommonLanguage[req.params.language] || 0],
            StringHandler.replaceString(ErrorHandlerWording.CAUSE.R_1[CommonLanguage[req.params.language] || 0], [
                req.path,
            ])
        )
    );
};

/**
 * Error handler
 *
 * @param error
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @return {void}
 */
export const errorHandler = (
    { statusCode, message, cause, stack, input }: ExceptionCustomize,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let body: object = {};

    if (process.env.NODE_ENV === 'production') {
        body = {
            error: {
                cause,
                message,
                input: convertToString(input as { [key: string]: string | number }[]),
            },
        };
    } else {
        body = {
            error: {
                cause,
                message,
                input: convertToString(input as { [key: string]: string | number }[]),
                stack,
            },
        };
    }

    if (statusCode === ResponseStatusCode.NO_CONTENT) {
        res.status(statusCode).json();
    } else {
        res.status(statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR).json(body);
    }
};

export default { errorHandler, notFoundRoute };
