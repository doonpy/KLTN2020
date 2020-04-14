import { Request, Response } from 'express';
import { Exception } from '../../services/exception/exception.index';
import { ResponseStatusCode } from '../../common/common.response-status.code';
import ExceptionCustomize from '../../services/exception/exception.customize';

/**
 * Catch 404 and forward to error handler
 *
 * @param req
 * @param res
 * @param next
 */
export const notFoundRoute = (req: Request, res: Response, next: any): void => {
    const exceptionModule = require('../../services/exception/exception.index');
    const ErrorHandlerConstant = require('./error-handler.constant').ErrorHandlerConstant;
    const Common = require('../../common/common.index').Common;

    next(
        new exceptionModule.Exception.Customize(
            ResponseStatusCode.NOT_FOUND,
            ErrorHandlerConstant.PATH_NOT_FOUND,
            '%s does not exits.',
            [req.path]
        )
    );
};

/**
 * Error handler
 *
 * @param error
 * @param req
 * @param res
 * @param next
 */
export const errorHandler = (
    { statusCode, message, cause, stack }: ExceptionCustomize,
    req: Request,
    res: Response,
    next: any
): void => {
    const Common = require('../../common/common.index').Common;
    let body: object = {};

    if (process.env.NODE_ENV === 'development') {
        body = {
            error: {
                message,
                rootCause: cause,
                input: convertToString([req.params, req.query, req.body]),
                stack,
            },
        };
    } else {
        body = {
            error: {
                message,
                rootCause: cause,
                input: convertToString([req.params, req.query, req.body]),
            },
        };
    }

    if (statusCode === ResponseStatusCode.NO_CONTENT) {
        res.status(statusCode).json();
    } else {
        res.status(statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR).json(body);
    }
};

/**
 *
 * @return inputString
 *
 * @param inputs
 */
const convertToString = (inputs: { [key: string]: string }[]): string => {
    const inputString: string[] = [];

    if (inputs.length === 0) {
        return '';
    }

    inputs.forEach((input: { [key: string]: string }) => {
        const keys: string[] = Object.keys(input);

        if (keys.length === 0) {
            return;
        }

        keys.forEach((key: string) => {
            const value: any = input[key];

            if (typeof value === 'object') {
                inputString.push(`'${key}' => {${convertToString([value])}}`);
            } else {
                inputString.push(`'${key}' => '${value}'`);
            }
        });
    });

    return inputString.join(', ');
};

export default { errorHandler, notFoundRoute };
