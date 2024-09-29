const mongoose = require("mongoose");
require("dotenv").config;

exports.connectDb = () => {
  const dbUrl = process.env.DB_URL;
  mongoose
    .connect(dbUrl)
    .then(() => console.log("db connection successfully"))
    .catch((error) => {
      console.error(error);
      console.log("db connection unsuccessful");
    });
};
