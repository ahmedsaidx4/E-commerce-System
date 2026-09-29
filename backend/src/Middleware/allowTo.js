const appError = require("../utils/appError");

module.exports = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new appError("This Role Not Allowed", 401, "FAIL"));
    }
    next();
  };
};
