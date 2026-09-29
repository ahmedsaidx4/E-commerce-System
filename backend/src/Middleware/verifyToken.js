const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");
const User = require("../Modules/User/user.model");

const verifyToken = async (req, res, next) => {
  const authHeader =
    req.headers["Authorization"] || req.headers["authorization"];
  if (!authHeader) {
    return next(new appError("Sorry, Token Required.", 401, "ERROR"));
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new appError("Sorry, Token Required.", 401, "ERROR"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "email role accountStatus",
    );

    if (!user) {
      return next(new appError("User not found.", 401, "ERROR"));
    }

    if (user.accountStatus === "inActive") {
      return next(new appError("Account is inactive.", 403, "ERROR"));
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (err) {
    const error = new appError("Invalid Token.", 401, "ERROR");
    return next(error);
  }
};
module.exports = verifyToken;
