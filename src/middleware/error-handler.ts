import { Request, Response } from 'express';
import { Constant } from '../util/definition/constant';
import CustomizeException from '../modules/exception/customize.exception';
import { ErrorMessage } from '../util/definition/error/message';

/**
 * Catch 404 and forward to error handler
 *
 * @param req
 * @param res
 * @param next
 */
const notFoundRoute = (req: Request, res: Response, next: any): void => {
    next(
        new CustomizeException(
            Constant.RESPONSE_STATUS_CODE.NOT_FOUND,
            ErrorMessage.ROUTES.NOT_FOUND,
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
const errorHandler = (
    { statusCode, message, cause, stack }: CustomizeException,
    req: Request,
    res: Response,
    next: any
): void => {
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

    if (statusCode === Constant.RESPONSE_STATUS_CODE.NO_CONTENT) {
        res.status(statusCode).json();
    } else {
        res.status(statusCode).json(body);
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
                inputString.push(`${key} => {${convertToString([value])}}`);
            } else {
                inputString.push(`${key} => ${value}`);
            }
        });
    });

    return inputString.join(', ');
};

export { notFoundRoute, errorHandler };
