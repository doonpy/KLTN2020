const express = require('express');

const app = express();

// database
require('./configs/database');

// storage folder
require('./configs/storage').init();

// routes
require('./configs/routes').init(app);

// middleware
require('./configs/middleware').init(app);

require('./nope');

module.exports = app;
