import { Request, Response } from 'express';
import { Exception } from '../../services/exception/exception.index';

/**
 * Catch 404 and forward to error handler
 *
 * @param req
 * @param res
 * @param next
 */
export const notFoundRoute = (req: Request, res: Response, next: any): void => {
    const Exception = require('../../services/exception/exception.index').Exception;
    const ErrorHandlerConstant = require('./error-handler.constant').ErrorHandlerConstant;
    const Common = require('../../common/common.index').Common;

    next(
        new Exception.Customize(
            Common.ResponseStatusCode.NOT_FOUND,
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
    { statusCode, message, cause, stack }: Exception.Customize,
    req: Request,
    res: Response,
    next: any
): void => {
    const Common = require('../../common/common.index').Common;
    let body: object = {};

    if (process.env.NODE_ENV === 'development') {
        body = {
            error: {
                message: message,
                rootCause: cause,
                input: convertToString([req.params, req.query, req.body]),
                stack: stack,
            },
        };
    } else {
        body = {
            error: {
                message: message,
                rootCause: cause,
                input: convertToString([req.params, req.query, req.body]),
            },
        };
    }

    if (statusCode === Common.ResponseStatusCode.NO_CONTENT) {
        res.status(statusCode).json();
    } else {
        res.status(statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR).json(body);
    }
};

/**
 *
 * @return inputString
 *
 * @param inputs
 */
const convertToString = (inputs: Array<{ [key: string]: string }>): string => {
    let inputString: Array<string> = [];

    if (inputs.length === 0) {
        return '';
    }

    inputs.forEach((input: { [key: string]: string }) => {
        let keys: Array<string> = Object.keys(input);

        if (keys.length === 0) {
            return;
        }

        keys.forEach((key: string) => {
            let value: any = input[key];

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
