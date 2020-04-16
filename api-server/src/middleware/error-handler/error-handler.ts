import { NextFunction, Request, Response } from 'express';
import ResponseStatusCode from '../../common/common.response-status.code';
import ExceptionCustomize from '../../services/exception/exception.customize';
import Exception from '../../services/exception/exception.index';
import ErrorHandlerConstant from './error-handler.constant';

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
            const value: object | string | number | undefined | null = input[key];

            if (typeof value === 'object') {
                inputString.push(`'${key}' => {${convertToString([value])}}`);
            } else {
                inputString.push(`'${key}' => '${value}'`);
            }
        });
    });

    return inputString.join(', ');
};

/**
 * Catch 404 and forward to error handler
 *
 * @param req
 * @param res
 * @param next
 */
export const notFoundRoute = (req: Request, res: Response, next: NextFunction): void => {
    next(
        new Exception.Customize(
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
    next: NextFunction
): void => {
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

export default { errorHandler, notFoundRoute };
