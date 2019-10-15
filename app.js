const express = require('express');
const app = express();

(async () => {
  // database
  require('./configs/database');

  // storage folder
  await require('./configs/storage').init();

  // middleware
  await require('./configs/middleware').init(app);

  // routes
  await require('./configs/routes').init(app);

  await require('./nope');
})();

module.exports = app;
