const User = require("../User/user.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const fs = require("node:fs");
const asyncWrapper = require("../../Middleware/errorHandler");
const appError = require("../../utils/appError");
const {
  sendEmailVerification,
  sendForgetPassword,
} = require("../Auth/email.verify");
const RefreshSession = require("../../Modules/RefreshSession/refreshSession.model");
const hashToken = require("../../utils/hashToken");
const { sanitizeUser } = require("../../utils/sanitizeUser");
const {
  refreshCookieOptions,
  clearRefreshCookieOptions,
} = require("../../utils/cookieOptions");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generatToken");

//-------------------Registration-----------------------

const register = asyncWrapper(async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  const existingUser = await User.findOne({ email: email }).exec();
  if (existingUser) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    return next(new appError("Sorry, Email Already Exist.", 409, "FAIL"));
  }

  const hashPassword = await bcrypt.hash(password, 12);
  const user = new User({
    first_name,
    last_name,
    email,
    password: hashPassword,
    image: req.file ? `/uploads/avatars/${req.file.filename}` : null,
  });
  user.register_Date = new Date();
  await user.save();
  await sendEmailVerification(user);

  return res.status(201).json({
    status: "success",
    message: "Account created successfully. Please verify your email.",
  });
});

const confirmEmail = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.userId).exec();
  if (!user) {
    return next(new appError("Email Not Found", 404, "FAIL"));
  }
  const secret =
    process.env.JWT_SECRET + user.emailVerificationStatus + user._id;
  try {
    jwt.verify(req.params.tokenVerify, secret);
  } catch (error) {
    return next(
      new appError("Token expired or invalid signature", 403, "FAIL"),
    );
  }
  user.emailVerificationStatus = true;
  user.emailVerificationTokenExpiresAt = null;
  await user.save();
  return res.status(200).json({
    status: "success",
    message: "Email Verification Successful",
  });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email }).exec();
  if (!user) {
    return next(new appError("Email Not Found", 404, "FAIL"));
  }
  if (user.accountStatus == "inActive") {
    return next(
      new appError(
        "Account InActive, Please Contact Admin for Active Account",
        403,
        "ERROR",
      ),
    );
  }

  if (!user.emailVerificationStatus) {
    const now = new Date();

    if (
      !user.emailVerificationTokenExpiresAt ||
      user.emailVerificationTokenExpiresAt <= now
    ) {
      await sendEmailVerification(user);
    }
    return res.status(401).json({
      status: "fail",
      message: "Please verify your email and login again.",
    });
  }

  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) {
    return next(new appError("Incorrect Password", 401, "ERROR"));
  }
  const token = await generateAccessToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = await generateRefreshToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });
  const tokenFamily = crypto.randomUUID();
  await RefreshSession.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    tokenFamily,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  res.cookie("refreshToken", refreshToken, refreshCookieOptions());

  user.last_login = new Date();
  await user.save();
  return res.status(200).json({
    status: "success",
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

const refresh = asyncWrapper(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return next(
      new appError("Unauthorized, Refresh Token Is Required.", 401, "ERROR"),
    );
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    res.clearCookie("refreshToken", clearRefreshCookieOptions());
    return next(
      new appError("Invalid or expired refresh token.", 401, "ERROR"),
    );
  }

  const tokenHash = hashToken(refreshToken);

  const session = await RefreshSession.findOne({
    tokenHash,
  }).exec();

  if (!session) {
    res.clearCookie("refreshToken", clearRefreshCookieOptions());
    return next(new appError("Invalid refresh session.", 401, "ERROR"));
  }

  /*
   * Token was already revoked.
   * This can indicate refresh token reuse.
   */
  if (session.revokedAt) {
    await RefreshSession.updateMany(
      {
        userId: session.userId,
        tokenFamily: session.tokenFamily,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );

    res.clearCookie("refreshToken", clearRefreshCookieOptions());
    return next(
      new appError(
        "Refresh token reuse detected. Please login again.",
        401,
        "ERROR",
      ),
    );
  }

  if (session.expiresAt <= new Date()) {
    res.clearCookie("refreshToken", clearRefreshCookieOptions());
    return next(
      new appError(
        "Refresh session expired. Please login again.",
        401,
        "ERROR",
      ),
    );
  }

  if (String(decoded.id) !== String(session.userId)) {
    res.clearCookie("refreshToken", clearRefreshCookieOptions());
    return next(new appError("Invalid refresh token.", 401, "ERROR"));
  }

  const user = await User.findById(session.userId).exec();

  if (!user) {
    res.clearCookie("refreshToken", clearRefreshCookieOptions());
    return next(new appError("User not found.", 401, "ERROR"));
  }

  if (user.accountStatus === "inActive") {
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
    return next(new appError("Account is inactive.", 403, "ERROR"));
  }

  /*
   * Revoke old refresh token
   */
  session.revokedAt = new Date();
  session.lastUsedAt = new Date();

  /*
   * Generate new tokens
   */
  const accessToken = await generateAccessToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  const newRefreshToken = await generateRefreshToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  /*
   * Hash new refresh token
   */
  const newRefreshTokenHash = hashToken(newRefreshToken);

  /*
   * Create new session with same token family
   */
  await RefreshSession.create({
    userId: user._id,
    tokenHash: newRefreshTokenHash,
    tokenFamily: session.tokenFamily,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  session.replacedBy = newRefreshTokenHash;

  await session.save();

  /*
   * Replace cookie
   */
  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions());

  return res.status(200).json({
    status: "success",
    data: {
      token: accessToken,
    },
  });
});

const logout = asyncWrapper(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);

    await RefreshSession.findOneAndUpdate(
      {
        tokenHash,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }

  res.clearCookie("refreshToken", clearRefreshCookieOptions());
  res.clearCookie("connect.sid");

  return res.status(200).json({
    status: "success",
    message: "Logout Successful.",
  });
});
const logoutAll = asyncWrapper(async (req, res, next) => {
  const userId = req.user.id;
  await RefreshSession.updateMany(
    {
      userId,
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
    message: "Logged out from all devices.",
  });
});

const forgotPassword = asyncWrapper(async (req, res, next) => {
  const now = new Date();
  const { email } = req.body;
  const user = await User.findOne({ email: email }).exec();
  if (!user) {
    return res.status(200).json({
      status: "success",
      message: "If this email exists, a reset link has been sent.",
    });
  }

  if (
    !user.forgetPasswordTokenExpiresAt ||
    user.forgetPasswordTokenExpiresAt <= now
  ) {
    await sendForgetPassword(user);
    return res.status(200).json({
      status: "success",
      message: "If this email exists, a reset link has been sent.",
    });
  }
  return res.status(200).json({
    status: "success",
    message: "If this email exists, a reset link has been sent.",
  });
});

const resetPassword = asyncWrapper(async (req, res, next) => {
  const token = req.params.token;
  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(new appError("user not found.", 404, "FAIL"));
  }
  let decoded;
  const secret = process.env.JWT_SECRET + user._id + user.password;
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    return next(
      new appError("Invalid Token or Invalid Signature.", 401, "ERROR"),
    );
  }
  const { newPassword } = req.body;
  const matchedPassword = await bcrypt.compare(newPassword, user.password);
  if (matchedPassword) {
    return next(
      new appError(
        "The password is already in use; please use a different password.",
        401,
        "FAIL",
      ),
    );
  }
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  user.password_changedAt = new Date();
  user.forgetPasswordTokenExpiresAt = null;
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
  await user.save();
  return res
    .status(200)
    .json({ status: "success", message: "Updated Password Successful." });
});

const changePassword = asyncWrapper(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new appError("User not found.", 404, "ERROR"));
  }
  if (newPassword == currentPassword) {
    return next(
      new appError(
        "Enter a password different from the current one.",
        400,
        "ERROR",
      ),
    );
  }

  const matchedPassword = await bcrypt.compare(currentPassword, user.password);
  if (!matchedPassword) {
    return next(new appError("Current Password Incorrect.", 401, "ERROR"));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  user.password_changedAt = new Date();
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
  return res
    .status(200)
    .json({ status: "success", message: "Password changed successfully." });
});
module.exports = {
  register,
  confirmEmail,
  login,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  changePassword,
};
