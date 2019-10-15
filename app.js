const express = require('express');
const ConnectDB = require('./configs/database')
const app = express();

// database
ConnectDB();
// routes
require('./configs/routes').init(app);

// middleware
require('./configs/middleware').init(app);

module.exports = app;
