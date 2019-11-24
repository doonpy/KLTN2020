const express = require("express");
const app = express();
const databaseConfig = require("./configs/database-config");
const middlewareConfig = require("./configs/middleware-config");
const routeConfig = require("./configs/routes-config");
const scheduleConfig = require("./configs/schedule-config");

// execute config
databaseConfig.init();
middlewareConfig.init(app);
routeConfig.init(app);
scheduleConfig.init();

module.exports = app;
