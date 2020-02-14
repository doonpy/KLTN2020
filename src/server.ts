import App from './app';
import * as bodyParser from 'body-parser';
import requestLogger from './middleware/request-logger';
import * as dotenv from 'dotenv';
import HostController from './modules/host/host.controller';
import CatalogController from './modules/catalog/catalog.controller';
import PatternController from './modules/pattern/pattern.controller';

dotenv.config();

const app = new App({
    port: process.env.SERVER_PORT,
    controllers: [
        new HostController(),
        new CatalogController(),
        new PatternController(),
    ],
    middleWares: [
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        requestLogger,
    ],
});

app.enableListen();
