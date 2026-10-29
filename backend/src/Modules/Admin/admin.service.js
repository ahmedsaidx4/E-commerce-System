const User = require("../User/user.model");
const asyncWrapper = require("../../Middleware/errorHandler");
const appError = require("../../utils/appError");
const roleState = require("../../utils/roleState");
const { sanitizeUser, sanitizeUsers } = require("../../utils/sanitizeUser");

const addAdmin = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.userId).exec();
  if (!user) {
    return next(new appError("Sorry, User Not Found", 404, "FAIL"));
  }
  if (user.role == roleState.Admin) {
    return next(new appError("The user already Admin", 200, "FAIL"));
  }
  user.role = roleState.Admin;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "The user has been added to admin group.",
    data: {
      user: sanitizeUser(user),
    },
  });
});
const deleteAdmin = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.userId).exec();
  if (!user) {
    return next(new appError("Sorry, User Not Found", 404, "FAIL"));
  }
  if (toString(req.user.id) === toString(user._id)) {
    return next(
      new appError("can not remove you in admin group.", 400, "FAIL"),
    );
  }
  if (user.role === roleState.User) {
    return next(new appError("The user already User", 400, "FAIL"));
  }
  user.role = roleState.User;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "The user has been added to user group.",
    data: {
      user: sanitizeUser(user),
    },
  });
});

const getAllAdmin = asyncWrapper(async (req, res, next) => {
  const admins = await User.find({ role: roleState.Admin }).exec();
  return res
    .status(200)
    .json({ status: "success", data: { admins: sanitizeUsers(admins) } });
});

//-------------------------------------User   route   ------------------------

const getAllUsers = asyncWrapper(async (req, res, next) => {
  const users = await User.find({});
  return res
    .status(200)
    .json({ status: "success", data: { users: sanitizeUsers(users) } });
});
const getSingleUsers = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(new appError("User not found.", 404, "FAIL"));
  }

  return res
    .status(200)
    .json({ status: "success", data: { user: sanitizeUser(user) } });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) {
    return next(new appError("User not found.", 404, "FAIL"));
  }
  return res
    .status(200)
    .json({ status: "success", message: "User deleted successfully." });
});

const updateUserStatus = asyncWrapper(async (req, res, next) => {
  const { accountStatus } = req.body;

  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(new appError("User not found.", 404, "FAIL"));
  }

  user.accountStatus = accountStatus;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: `Account ${accountStatus === "Active" ? "activated" : "deactivated"} successfully.`,
    data: {
      user: sanitizeUser(user),
    },
  });
});

module.exports = {
  addAdmin,
  deleteAdmin,
  getAllAdmin,
  deleteUser,
  getAllUsers,
  getSingleUsers,
  updateUserStatus,
};
