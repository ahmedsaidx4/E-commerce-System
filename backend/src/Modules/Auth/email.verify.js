const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const getClientUrl = () => process.env.CLIENT_URL || "http://localhost:3000";

const sendEmailVerification = async (user) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const secret =
    process.env.JWT_SECRET + user.emailVerificationStatus + user._id;
  const tokenVerfiy = await jwt.sign(
    { id: user._id, email: user.email },
    secret,
    { expiresIn: "10m" },
  );
  user.emailVerificationTokenExpiresAt = expiresAt;
  await user.save();
  const link = `${getClientUrl()}/api/v1/auth/verify-email/${user._id}/${tokenVerfiy}`;
  const nodemailerOptions = {
    from: process.env.USER_MAIL,
    to: user.email,
    subject: "Email Verification",
    html: `<div>
            <h2>Email Verification</h2>
            <h3>Click on Blue Link</h3>
            <p>${link}</p>
        </div>`,
  };
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.USER_PASS,
    },
  });

  await transporter.sendMail(nodemailerOptions);
};

const sendForgetPassword = async (user) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const secret = process.env.JWT_SECRET + user._id + user.password;
  const token = jwt.sign({ id: user._id, email: user.email }, secret, {
    expiresIn: "10m",
  });
  user.forgetPasswordTokenExpiresAt = expiresAt;
  await user.save();
  const link = `${getClientUrl()}/reset-password/${user._id}/${token}`;
  const nodemailerOptions = {
    from: process.env.USER_MAIL,
    to: user.email,
    subject: "Reset Password",
    html: `<div>
            <h2>Reset Password</h2>
            <h3>Click on Blue Link</h3>
            <p>${link}</p>
        </div>`,
  };
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.USER_PASS,
    },
  });

  await transporter.sendMail(nodemailerOptions);
};
module.exports = {
  sendEmailVerification,
  sendForgetPassword,
};
