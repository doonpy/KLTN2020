import {Request, Response} from "express";
import {Constant} from "../util/definition/constant";
import MessageLog from "../util/message-log";

const requestLogger = (req: Request, res: Response, next: any) => {
    new MessageLog(
        Constant.MESSAGE_TYPE.INFO,
        `Request: ${req.method} | ${req.path} | ${res.statusCode}`
    ).show();
    next();
};

export default requestLogger;
