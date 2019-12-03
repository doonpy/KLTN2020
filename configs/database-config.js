const mongoose = require("mongoose");

exports.init = () => {
  const connString = `mongodb+srv://${process.env.DB_USER}:${
    process.env.DB_PASS
  }@${process.env.DB_HOST}${
    process.env.DB_PORT !== "" ? `:${process.env.DB_PORT}` : ""
  }/${process.env.DB_NAME}?retryWrites=true&w=majority`;

  mongoose
    .connect(connString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
    .then(() => {
        require("../models/host-model");
        require("../models/catalog-model");
        require("../models/definition-model");
        require("../models/extract-log-model");
        require("../models/detail-url-model");
        require("../models/raw-data-model");
        console.log("=> Connect database success!");
    })
    .catch(err => {
      console.log("=> Connect database failed!\n", err);
    });
};
