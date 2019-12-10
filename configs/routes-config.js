const indexRouter = require("../routes/index-route");
const catalogRouter = require("../routes/catalog-route");
const definitionRouter = require("../routes/definition-route");
const apiRouter = require("../routes/api-route");
const compileDataRouter = require("../routes/compile-data-route");
const createError = require("http-errors");

/**
 *
 * @param app
 */
exports.init = app => {
  app.use("/", indexRouter);
  app.use("/definition", definitionRouter);
  app.use("/catalog", catalogRouter);
  app.use("/api", apiRouter);
  app.use("/compile-data", compileDataRouter);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.locals.isDebugMode=process.env.DEBUG_MODE;
    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });
};
