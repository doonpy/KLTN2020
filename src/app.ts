import express from "express";
import { Application } from "express";
import path from "path";
import chalk from "chalk";

class App {
  public app: Application;
  public port: any;

  constructor(appInit: { port: any; middleWares: any; controllers: any }) {
    this.app = express();
    this.port = appInit.port || 3000;

    this.bindMiddlewares(appInit.middleWares);
    this.bindRoutes(appInit.controllers);
    this.settingAssets();
    this.settingTemplate();
  }

  /**
   * Bind middlewares
   * @param middleWares
   */
  private bindMiddlewares(middleWares: {
    forEach: (arg0: (middleWare: any) => void) => void;
  }) {
    middleWares.forEach(middleWare => {
      this.app.use(middleWare);
    });
  }

  /**
   * Bind routes
   * @param routes
   */
  private bindRoutes(routes: {
    forEach: (arg0: (controller: any) => void) => void;
  }) {
    routes.forEach(controller => {
      this.app.use("/", controller.router);
    });
  }

  /**
   * Setting assets
   */
  private settingAssets() {
    this.app.use(express.static("../public"));
  }

  /**
   * Setting template engine
   */
  private settingTemplate() {
    this.app.set("views", path.join(__dirname, "../views"));
    this.app.set("view engine", "pug");
  }

  /**
   * Enable listen port
   */
  public enableListen() {
    this.app.listen(this.port, () => {
      console.log(chalk.blue("[INFO]"), `App listening on the http://localhost:${this.port}`);
    });
  }
}

export default App;
