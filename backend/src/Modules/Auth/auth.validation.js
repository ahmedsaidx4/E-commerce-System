const joi = require("joi");

const registerSchema = joi.object({
  first_name: joi.string().min(3).max(32).required(),
  last_name: joi.string().min(3).max(32).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).max(32).required(),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).max(32).required(),
});
const changePasswordSchema = joi.object({
  currentPassword: joi.string().min(6).max(32).required(),
  newPassword: joi.string().min(6).max(32).required(),
  confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
});

const forgotPasswordSchema = joi.object({
  email: joi.string().email().required(),
});

const resetPasswordSchema = joi.object({
  newPassword: joi.string().min(6).max(32).required(),
  confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
