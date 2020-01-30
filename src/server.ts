import App from "./app";
import * as bodyParser from "body-parser";
import loggerMiddleware from "./middleware/logger";
import HomeController from "./modules/home/home.controller";
import * as dotenv from "dotenv";

dotenv.config();

const app = new App({
  port: process.env.SERVER_PORT,
  controllers: [new HomeController()],
  middleWares: [
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    loggerMiddleware
  ]
});

app.enableListen();
