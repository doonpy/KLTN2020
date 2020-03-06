import express, { Application } from 'express';
import path from 'path';
import ConsoleLog from './util/console/console.log';
import { Database } from './services/database/database.index';
import { ConsoleConstant } from './util/console/console.constant';
import { errorHandler, notFoundRoute } from './middleware/error-handler/error-handler';

export default class App {
    private app: Application;
    private readonly serverPort: any;

    constructor(appInit: { port: any; middleWares: any; controllers: any }) {
        this.app = express();
        this.serverPort = appInit.port;

        new Database.MongoDb()
            .connect()
            .then((): void => {
                this.settingAssets();
                this.bindMiddlewares(appInit.middleWares);
                this.bindRoutes(appInit.controllers);
            })

            .catch((error: Error): void => {
                new ConsoleLog(ConsoleConstant.Type.ERROR, error.message).show();
            });
    }

    /**
     * Bind middleware
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
        this.app.use(express.static(path.join(__dirname, '../public')));
    }

    /**
     * Enable listen port
     */
    public enableListen(): void {
        this.app.listen(this.serverPort, (): void => {
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `App listening on the http://localhost:${this.serverPort}`
            ).show();
        });
    }
}
