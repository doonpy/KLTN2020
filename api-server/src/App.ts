import express from 'express';
import { Application } from 'express-serve-static-core';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import { errorHandler, notFoundRoute } from '@middleware/error-handler';

type TemplateEngine = 'pug' | 'jsx' | 'html';

type Controller = {
    cPath: string;
    controllers: any[];
};

interface Settings {
    protocol: string;
    domain: string;
    port: string;
    controllers: Controller[];
    middlewares: any[];
    viewPath?: string;
    templateEngine?: TemplateEngine;
    staticPath?: string;
}

export class App {
    private app: Application;
    private settings: Settings;

    constructor(settings: Settings) {
        this.app = express();
        this.settings = settings;
    }

    /**
     * Start server
     */
    public start(): void {
        this.setAssets();
        this.bindMiddleware();
        this.bindRoutes();
        this.enableListen();
    }

    /**
     * Bind middleware
     */
    private bindMiddleware(): void {
        this.settings.middlewares.forEach((middleware: any): void => {
            this.app.use(middleware);
        });
    }

    /**
     * Bind routes
     */
    private bindRoutes(): void {
        this.settings.controllers.forEach(({ cPath, controllers }): void => {
            controllers.forEach((controller) =>
                this.app.use(cPath, controller.router)
            );
        });

        this.app.use(notFoundRoute, errorHandler);
    }

    /**
     * Setting assets
     */
    private setAssets(): void {
        if (this.settings.staticPath) {
            this.app.use(express.static(this.settings.staticPath));
        }

        if (this.settings.viewPath && this.settings.templateEngine) {
            this.app.set('views', this.settings.viewPath);
            this.app.set('view engine', this.settings.templateEngine);
        }
    }

    /**
     * Enable listen port
     */
    public enableListen(): void {
        this.app.listen(this.settings.port, (): void => {
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `App listening on the ${this.settings.protocol}://${this.settings.domain}:${this.settings.port}`
            ).show();
        });
    }
}
