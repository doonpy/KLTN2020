/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application } from 'express';
import path from 'path';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import {
    errorHandler,
    notFoundRoute,
} from '@middleware/error-handler/error-handler';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';

export default class App {
    private static instance: App | undefined;

    private app: Application;

    private readonly protocol: string | undefined;

    private readonly domain: string | undefined;

    private readonly serverPort: string | undefined;

    constructor() {
        this.app = express();
        if (process.env.NODE_ENV === 'production') {
            this.protocol = process.env.PROD_SERVER_PROTOCOL;
            this.domain = process.env.PROD_SERVER_DOMAIN;
            this.serverPort = process.env.PROD_SERVER_PORT;
        } else {
            this.protocol = process.env.DEV_SERVER_PROTOCOL;
            this.domain = process.env.DEV_SERVER_DOMAIN;
            this.serverPort = process.env.DEV_SERVER_PORT;
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

    /**
     * Start server
     *
     * @param middlewareArray
     * @param controllerArray
     */
    public start(
        middlewareArray: Array<any>,
        controllerArray: CommonServiceControllerBase[]
    ): void {
        this.setAssets();
        this.bindMiddleware(middlewareArray);
        this.bindRoutes(controllerArray);
        this.enableListen();
    }

    /**
     * Bind middleware
     *
     * @param middlewareArray
     */
    private bindMiddleware(middlewareArray: Array<any>): void {
        middlewareArray.forEach((middleware: any): void => {
            this.app.use(middleware);
        });
    }

    /**
     * Bind routes
     *
     * @param routes
     */
    private bindRoutes(routes: CommonServiceControllerBase[]): void {
        routes.forEach((controller: CommonServiceControllerBase): void => {
            this.app.use('/api/v1', controller.router);
        });

        this.app.use(notFoundRoute, errorHandler);
    }

    /**
     * Setting assets
     */
    private setAssets(): void {
        if (process.env.PUBLIC_FOLDER_PATH) {
            this.app.use(
                express.static(
                    path.join(__dirname, process.env.PUBLIC_FOLDER_PATH)
                )
            );
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
