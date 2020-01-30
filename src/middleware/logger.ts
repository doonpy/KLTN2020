import { Request, Response } from "express";
import chalk from "chalk";

const loggerMiddleware = (req: Request, res: Response, next: any) => {
  console.log(
    chalk.blue("[INFO]"),
    chalk.yellow(req.method),
    req.path,
    "-",
    res.statusCode
  );
  next();
};

export default loggerMiddleware;
