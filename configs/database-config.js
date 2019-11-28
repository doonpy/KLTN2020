const mongoose = require("mongoose");

exports.init = () => {
  const connString = `mongodb+srv://${process.env.DB_USER}:${
      process.env.DB_PASS
  }@${process.env.DB_HOST}${
      process.env.DB_PORT !== "" ? `:${process.env.DB_PORT}` : ""
  }/${process.env.DB_NAME}?retryWrites=true&w=majority`;

  // const connString = "mongodb://localhost:27017/tlcn_2019";

  mongoose
    .connect(connString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    .then(() => {
      console.log("=> Connect database success!");
    })  
    .catch(err => {
      console.log("=> Connect database failed!\n", err);
    });
};
