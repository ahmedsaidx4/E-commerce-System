const jwt = require("jsonwebtoken");

module.exports.generateAccessToken = async (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
  return token;
};
module.exports.generateRefreshToken = async (payload) => {
  const refreshtoken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return refreshtoken;
};
