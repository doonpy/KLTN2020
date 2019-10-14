const express = require('express');

const app = express();

// database
require('./configs/database');

// routes
require('./configs/routes').init(app);

// middleware
require('./configs/middleware').init(app);

module.exports = app;
