const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fileHelper = require("../helper/file-helper");

/**
 *
 * @param app
 */
exports.init = app => {
    // Init temp folder
    fileHelper.initTempFolder();

    // view engine setup
    app.set("views", path.join(__dirname, "../views"));
    app.set("view engine", "pug");

    app.use(logger("dev"));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, "../public")));
};
