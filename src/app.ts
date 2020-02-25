import express, { Application } from 'express';
import path from 'path';
import MessageLog from './util/message-log';
import { Constant } from './util/definition/constant';
import DatabaseConnection from './modules/database/database';
import { errorHandler, notFoundRoute } from './middleware/error-handler';
import DetailUrlScrape from './worker/scrape/detail-url/detail-url.scrape';
import RawDataScrape from './worker/scrape/raw-data/raw-data.scrape';

class App {
    private app: Application;
    private readonly serverPort: any;

    constructor(appInit: { port: any; middleWares: any; controllers: any }) {
        this.app = express();
        this.serverPort = appInit.port;

        new DatabaseConnection()
            .connect()
            .then(async () => {
                this.settingAssets();
                this.settingTemplate();
                this.bindMiddlewares(appInit.middleWares);
                this.bindRoutes(appInit.controllers);

                // await new DetailUrlScrape(2).start();
                // await new RawDataScrape(2).start();
            })
            .catch(error => {
                new MessageLog(Constant.MESSAGE_TYPE.ERROR, error.message).show();
            });
    }

    /**
     * Bind middlewares
     *
     * @param middleWares
     */
    private bindMiddlewares(middleWares: {
        forEach: (arg0: (middleWare: any) => void) => void;
    }): void {
        middleWares.forEach((middleWare: any): void => {
            this.app.use(middleWare);
        });
    }

    /**
     * Bind routes
     *
     * @param routes
     */
    private bindRoutes(routes: { forEach: (arg0: (controller: any) => void) => void }): void {
        routes.forEach((controller: any): void => {
            this.app.use('/', controller.router);
        });

        this.app.use(notFoundRoute);
        this.app.use(errorHandler);
    }

    /**
     * Setting assets
     */
    private settingAssets(): void {
        this.app.use(express.static('../public'));
        this.app.use(express.static(path.join(__dirname, '../log')));
    }

    /**
     * Setting template engine
     */
    private settingTemplate(): void {
        // this.app.set('views', path.join(__dirname, '../views'));
        // this.app.set('view engine', 'pug');
    }

    /**
     * Enable listen port
     */
    public enableListen(): void {
        this.app.listen(this.serverPort, (): void => {
            new MessageLog(
                Constant.MESSAGE_TYPE.INFO,
                `App listening on the http://localhost:${this.serverPort}`
            ).show();
        });
    }
}

export default App;
