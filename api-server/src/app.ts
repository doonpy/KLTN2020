import express from 'express';
import { Application } from 'express-serve-static-core';
import path from 'path';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import { errorHandler, notFoundRoute } from '@middleware/error-handler';
import ServiceControllerBase from '@service/ServiceControllerBase';

export default class App {
    private static instance: App | undefined;

    private app: Application;

    private readonly protocol: string | undefined;

    private readonly domain: string | undefined;

    private readonly serverPort: string | undefined;

    constructor() {
        this.app = express();
        this.protocol = process.env.SERVER_PROTOCOL;
        this.domain = process.env.SERVER_DOMAIN;
        this.serverPort = process.env.SERVER_PORT;
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
     */
    public start(
        middlewareArray: any[],
        controllerArray: ServiceControllerBase[]
    ): void {
        this.setAssets();
        this.bindMiddleware(middlewareArray);
        this.bindRoutes(controllerArray);
        this.enableListen();
    }

    /**
     * Bind middleware
     */
    private bindMiddleware(middlewareArray: any[]): void {
        middlewareArray.forEach((middleware: any): void => {
            this.app.use(middleware);
        });
    }

    /**
     * Bind routes
     */
    private bindRoutes(routes: ServiceControllerBase[]): void {
        routes.forEach((controller: ServiceControllerBase): void => {
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
