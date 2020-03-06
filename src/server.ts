import App from './app';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { RawData } from './services/raw-data/raw-data.index';
import { Host } from './services/host/host.index';
import { Catalog } from './services/catalog/catalog.index';
import { Pattern } from './services/pattern/pattern.index';
import { DetailUrl } from './services/detail-url/detail-url.index';
import { requestLogger } from './middleware/request-logger/request-logger';

dotenv.config();

const app = new App({
    port: process.env.SERVER_PORT,
    controllers: [
        new Host.Controller(),
        new Catalog.Controller(),
        new Pattern.Controller(),
        new DetailUrl.Controller(),
        new RawData.Controller(),
    ],
    middleWares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), requestLogger],
});

app.enableListen();
