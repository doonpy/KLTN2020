import { NextFunction, Request, Response } from 'express-serve-static-core';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';

export default (req: Request, res: Response, next: NextFunction): void => {
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Request: ${req.method} - ${req.originalUrl}`
    ).show();
    next();
};
