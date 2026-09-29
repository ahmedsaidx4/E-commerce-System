const User = require("./user.model");
const RefreshSession = require("../RefreshSession/refreshSession.model");
const bcrypt = require("bcrypt");
const asyncWrapper = require("../../Middleware/errorHandler");
const appError = require("../../utils/appError");
const { sanitizeUser } = require("../../utils/sanitizeUser");
const { clearRefreshCookieOptions } = require("../../utils/cookieOptions");

const profile = asyncWrapper(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById({ _id: userId }, { password: false }).exec();
  if (!user) {
    return next(new appError("User not found", 404, "FAIL"));
  }
  return res.status(200).json({
    status: "success",
    data: {
      user: sanitizeUser(user),
    },
  });
});

const editProfile = asyncWrapper(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findByIdAndUpdate(userId, req.body, {
    returnDocument: "after",
  }).exec();
  if (!user) {
    return next(new appError("user not found", 404, "FAIL"));
  }
  return res.status(200).json({
    status: "success",
    data: {
      user: sanitizeUser(user),
    },
  });
});

const deActive = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.id).exec();
  if (!user) {
    return next(new appError("user not found", 404, "ERROR"));
  }
  const { password } = req.body;
  if (!password) {
    return next(new appError("Sorry, please enter password", 401, "ERROR"));
  }
  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) {
    return next(new appError("Sorry, password incorrect", 401, "ERROR"));
  }
  user.accountStatus = "inActive";
  await user.save();
  await RefreshSession.updateMany(
    {
      userId: user._id,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );

  res.clearCookie("refreshToken", clearRefreshCookieOptions());
  res.clearCookie("connect.sid");

  return res.status(200).json({
    status: "success",
    message: "Account De-activate succeeded, Logged out from all devices.",
  });
});
module.exports = {
  profile,
  editProfile,
  deActive,
};
