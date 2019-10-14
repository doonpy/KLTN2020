const apiV1Routes = require('../api/routes/v1/api');

exports.init = (app) => {
  app.use('/api/v1', apiV1Routes);
};
