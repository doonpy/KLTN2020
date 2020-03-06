import { Request, Response } from 'express';
import ConsoleLog from '../../util/console/console.log';
import { ConsoleConstant } from '../../util/console/console.constant';

export const requestLogger = (req: Request, res: Response, next: any) => {
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Request: ${req.method} | ${req.path} | ${res.statusCode}`
    ).show();
    next();
};
