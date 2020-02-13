import App from './app';
import * as bodyParser from 'body-parser';
import requestLogger from './middleware/request-logger';
import HostController from './modules/host/host.controller';
import CatalogController from './modules/catalog/catalog.controller';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new App({
    port: process.env.SERVER_PORT,
    controllers: [new HostController(), new CatalogController()],
    middleWares: [
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        requestLogger,
    ],
});

app.enableListen();
