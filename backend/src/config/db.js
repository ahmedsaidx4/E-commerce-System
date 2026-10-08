const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const url = process.env.MONGO_URL;

const connectDB = () => {
  return mongoose.connect(url).then(() => {
    console.log("Database Connected Successful");
  });
};
module.exports = connectDB;
