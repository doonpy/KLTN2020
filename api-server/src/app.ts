import express, { Application } from 'express';
import path from 'path';
import ConsoleLog from './util/console/console.log';
import { ConsoleConstant } from './util/console/console.constant';
import { errorHandler, notFoundRoute } from './middleware/error-handler/error-handler';

export default class App {
    private static instance: App | undefined;
    private app: Application;
    private readonly protocol: string | undefined;
    private readonly domain: string | undefined;
    private readonly serverPort: string | undefined;

    constructor() {
        this.app = express();
        if (process.env.NODE_ENV === 'production') {
            this.protocol = process.env.SERVER_PROTOCOL;
            this.domain = process.env.SERVER_DOMAIN;
            this.serverPort = process.env.SERVER_PORT;
        } else {
            this.protocol = process.env.SERVER_PROTOCOL_DEV;
            this.domain = process.env.SERVER_DOMAIN_DEV;
            this.serverPort = process.env.SERVER_PORT_DEV;
        }
    }

    /**
     * Get instance
     */
    public static getInstance(): App {
        if (!this.instance) {
            this.instance = new App();
        }

        return this.instance;
    }

    public start(
        middlewareArray: { forEach: (arg0: (middleWare: any) => void) => void },
        controllerArray: { forEach: (arg0: (middleWare: any) => void) => void }
    ): void {
        this.settingAssets();
        this.bindMiddlewares(middlewareArray);
        this.bindRoutes(controllerArray);
        this.enableListen();
    }

    /**
     * Bind middleware
     *
     * @param middleWares
     */
    private bindMiddlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void }): void {
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
            this.app.use('/api/v1', controller.router);
        });

        this.app.use(notFoundRoute);
        this.app.use(errorHandler);
    }

    /**
     * Setting assets
     */
    private settingAssets(): void {
        if (process.env.PUBLIC_FOLDER_PATH) {
            this.app.use(express.static(path.join(__dirname, process.env.PUBLIC_FOLDER_PATH)));
        }
    }

    /**
     * Enable listen port
     */
    public enableListen(): void {
        this.app.listen(this.serverPort, (): void => {
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `App listening on the ${this.protocol}://${this.domain}:${this.serverPort}`
            ).show();
        });
    }
}
