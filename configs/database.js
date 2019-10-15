const mongoose = require('mongoose');
const connString = 'mongodb://localhost:27017/tlcn2019';
const option = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};
const bluebird = require('bluebird');

mongoose.Promise = bluebird;
mongoose
    .connect(connString, option)
    .then(() => {
      console.log('=> Connect database successful');
    })
    .catch((err) => {
      console.log('=> Connect database failed', err);
    });
