const User = require("../../models/userSchema");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const bycrypt = require("bcrypt");
const crypto = require("crypto");

//for forgot password
const getForgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log("error getting forgotpassword page", error);
    res.redirect("/page-not-found");
  }
};

//function to generate otp
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//function to send email
async function sendVerificationEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Verify your account",
      text: `Your otp is ${otp}`,
      html: `<b> Your otp is ${otp}</b>`,
    });

    return info.accepted.length > 0;
  } catch (error) {
    console.log("error sending email", error);
    return false;
  }
}

const forgotPasswordOtp = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({
    email: email,
    password: { $exists: true, $ne: null },
  });
  try {
    if (!user) {
      return res.render("forgotPassword", { message: "User Does not exist" });
    }

    const otp = generateOtp();
    console.log("forgot password", otp);

    const emailSent = sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.render("forgotPassword", { message: "Unable to sent email" });
    }
    req.session.userOtp = otp;
    req.session.email = email;

    res.render("forgotPasswordVerification");
  } catch (error) {
    console.log(error, "error forgot password otp rendering");
    return res.redirect("/page-not-found");
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (otp !== req.session.userOtp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    const user = await User.findOne({ email: req.session.email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>
             <p>This link is valid for 1 hour.</p>`,
    });

    res.json({
      success: true,
      message: "Password reset link sent to your email",
      redirectUrl: "/login",
    });
  } catch (error) {
    console.error("Error verifying forgot password OTP:", error);
    res.status(500).json({ success: false, message: "Server error occurred" });
  }
};

//for getting reset password
const getResetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    res.render("resetPassword", {
      token: token,
    });
  } catch (error) {
    console.log(error, "error at getting reset password");
  }
};

//for changing password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  try {
    const { password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user by token and check if the token is still valid
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json("Invalid or expired token");
    }

    // Hash the new password
    const hashedPassword = await bycrypt.hash(password, 10);
    console.log("hashed ", hashedPassword);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, redirectUrl: "/login" });
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
};

module.exports = {
  getForgotPassword,
  forgotPasswordOtp,
  verifyForgotPasswordOtp,
  getResetPassword,
  resetPassword,
};
