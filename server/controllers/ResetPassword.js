const crypto = require("crypto"); // to generate secure tokens
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// reset password token
exports.resetPasswordToken = async (req, res) => {
  try {
    // Get email from request body
    const { email } = req.body;

    // Check if the user exists with the provided email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Generate a token for password reset
    const token = crypto.randomBytes(20).toString("hex");

    // Set token expiration time (e.g., 1 hour from now)
    const expirationTime = Date.now() + 3600000; // 1 hour in milliseconds

    // Update user by adding the reset token and expiration time
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expirationTime;
    await user.save();

    // Create a password reset URL
    const url = `https://localhost:3000/update-Password/${token}`;

    // Send email with the reset password URL to the user
    await mailSender(
      email,
      "password reset link",
      `Paswword reset link :${url}`
    );

    // Return response
    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while processing the request os sending the mail.",
    });
  }
};

//  reset password

exports.resetPassword = async (res, req) => {
  try {
    // data fetch

    const { password, confirmPassword, token } = req.body;

    // validation
    if (password != confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }
    // get userdetails  from db using the token
    const userdetails = await User.findOne({ token: token });

    // if not entry -invalid token
    if (!userdetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    // token time check
    if (userdetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token has expired",
      });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // password update
    await User.findOneAndUpdate(
      {
        token: token,
      },
      { password: hashedPassword },
      { new: true }
    );

    //   return response
    return res.json({
      success: true,
      message: "password reset succesful",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "error while resetting password",
    });
  }
};
