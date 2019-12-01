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
          useFindAndModify: false, useCreateIndex: true,
      })
      .then(() => {
          console.log(
              `=> [W${process.pid} - ${require("moment")().format(
                  "L LTS"
              )}] Connect database success`
          );
          require("../models/catalog-model");
          require("../models/host-model");
          require("../models/definition-model");
          require("../models/raw-data-model");
      })
      .catch(err => {
          console.log("=> Connect database failed!\n", err);
      });
};
