const mongoose = require("mongoose");
const roleState = require("../../utils/roleState");
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: [roleState.Admin, roleState.Instructor, roleState.User],
      default: "User",
    },
    emailVerificationStatus: {
      type: Boolean,
      default: false,
    },
    emailVerificationTokenExpiresAt: {
      type: Date,
      default: null,
    },
    forgetPasswordTokenExpiresAt: {
      type: Date,
      default: null,
    },
    accountStatus: {
      type: String,
      enum: ["Active", "inActive"],
      default: "Active",
    },
    last_login: {
      type: Date,
    },
    register_Date: {
      type: Date,
    },
    password_changedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
