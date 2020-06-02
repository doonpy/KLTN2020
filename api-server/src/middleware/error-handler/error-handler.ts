import { NextFunction, Request, Response } from 'express';
import ResponseStatusCode from '@common/common.response-status.code';
import ExceptionCustomize from '@util/exception/exception.customize';
import {
    replaceMetaDataString,
    upperCaseFirstCharacter,
} from '@util/helper/string';
import CommonLanguage from '@common/common.language';
import ErrorHandlerWording from './error-handler.wording';

/**
 * @param input
 *
 * @return {string} inputString
 */
const convertToString = (
    input: { [key: string]: string | number }[]
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
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @return {void}
 */
export const notFoundRoute = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    next(
        new ExceptionCustomize(
            ResponseStatusCode.NOT_FOUND,
            replaceMetaDataString(
                ErrorHandlerWording.CAUSE.CAU_ERR_1[
                    CommonLanguage[req.params.language] || 0
                ],
                [req.path]
            ),
            ErrorHandlerWording.MESSAGE.MSG_ERR_1[
                CommonLanguage[req.params.language] || 0
            ]
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
    let body = {};

    if (process.env.NODE_ENV === 'production') {
        body = {
            error: {
                cause: upperCaseFirstCharacter(
                    cause ||
                        ErrorHandlerWording.CAUSE.CAU_ERR_2[
                            CommonLanguage[req.params.language] || 0
                        ]
                ),
                message: upperCaseFirstCharacter(message),
                input: convertToString(
                    input as { [key: string]: string | number }[]
                ),
            },
        };
    } else {
        body = {
            error: {
                cause: upperCaseFirstCharacter(
                    cause ||
                        ErrorHandlerWording.CAUSE.CAU_ERR_2[
                            CommonLanguage[req.params.language] || 0
                        ]
                ),
                message: upperCaseFirstCharacter(message),
                input: convertToString(
                    input as { [key: string]: string | number }[]
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
