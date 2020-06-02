import { NextFunction, Request, Response } from 'express';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';

export default (req: Request, res: Response, next: NextFunction): void => {
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Request: ${req.method} | ${req.path} | ${res.statusCode}`
    ).show();
    next();
};
