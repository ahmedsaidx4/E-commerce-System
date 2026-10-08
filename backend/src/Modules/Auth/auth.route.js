const express = require("express");
const router = express.Router();

const controller = require("../Auth/auth.controller");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../Auth/auth.validation");
const validate = require("../../Middleware/validate");
const verifyToken = require("../../Middleware/verifyToken");
const upload = require("./avatarUpload");

router
  .route("/register")
  .post(upload.single("image"), validate(registerSchema), controller.register);

router.route("/login").post(validate(loginSchema), controller.login);
router.route("/logout").post(controller.logout);
router.route("/logout-all").post(verifyToken, controller.logoutAll);

router.route("/verify-email/:userId/:tokenVerify").get(controller.confirmEmail);
router
  .route("/reset-password/:userId/:token")
  .post(validate(resetPasswordSchema), controller.resetPassword);

router.route("/refreshToken").post(controller.refresh);
router
  .route("/forgot-password")
  .post(validate(forgotPasswordSchema), controller.forgotPassword);
router
  .route("/change-password")
  .post(verifyToken, validate(changePasswordSchema), controller.changePassword);

//---------------------------------

module.exports = router;
