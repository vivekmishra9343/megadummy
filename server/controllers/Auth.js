const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtokens");
require("dotenv").config;

// send otp
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const checkuser = await User.findOne({ email });
    if (!checkuser) {
      return res.status(401).json({ message: "user does not exist" });
    }

    // gnerate otp

    var otp = otpGenerator.generate(6, {
      upperCase: false,
      numbers: true,
      lowerCaseAlphabets: false,
      specialChar: false,
    });
    console.log("otp generated", otp);

    // check unique otp o rnot
    const checkotp = await OTP.findOne({ otp });

    while (checkotp) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      checkotp = await OTP.findOne({ otp });
    }

    const otpPayload = { email, otp };
    // create an entry in db
    const otpEntry = new OTP(otpPayload);
    await otpEntry.save();

    console.log(otpEntry);

    res.status(200).json({
      message: "otp sent successfully",
      success: true,
      otp: otp,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// signup
exports.signUp = async (req, res) => {
  try {
    // Destructure data from request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // 1. Validation - Check if all fields are present
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //   find mst recenet stored otp for thr user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAT: -1 })
      .limit(1);
    console.log(recentOtp);

    // 4. Validate OTP
    if (recentOtp.length == 0) {
      //otp not found
      return res.status(400).json({ message: "otp not found", success: false });
    } else if (otp != recentOtp.otp) {
      //otp is not valid
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds set to 10

    // 6. Create user entry in the database

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumer: null,
    });

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      contactNumber,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
    });

    await newUser.save();

    // 7. Return success response
    return res.status(200).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    // Handle any other errors
    return res.status(500).json({
      success: false,
      message: "user could not be registered",
      error: error.message,
    });
  }
};

//  login in

const login = async (req, res) => {
  try {
    // get data from the request
    const { email, password } = req.body;

    // validation data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Please enter email and password",
      });
    }
    // user chek exist or not
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user is not registered,please signup first",
      });
    }
    // generate jwt  after mathcing passowrd
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user.id,
        accountType: user.accountType,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      // create cookie and send resposne
      res
        .cookie("jwt", token, {
          httpOnly: true,
          maxAge: 2 * 60 * 60 * 1000, // 2
        })
        .status(200)
        .json({
          success: true,
          message: "login success",
          user: user,
          token,
        });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "login failure plaese try again",
    });
  }
};
// change password
export const changePassword = async (req, res) => {
  try {
    // get data from request body
    const { oldPassword, newPassword, confirmNewPassword, email } = req.body;

    // fetch the user details
    const user = await User.findOne({ email: email });

    // check if newpassword and confirm password match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "new password and confirm password do not match",
      });
    }

    // check if old password is correct
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid old password",
      });
    } else {
      // hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // update then password in database
      await User.updateOne(
        { email: email },
        { password: hashedPassword },
        { new: true }
      );

      // send mail of password updated
      await mailSender(
        email,
        "password is changed",
        "your study notuion password has been changed"
      );

      // return response
      return res.status(200).json({
        success: true,
        message: "password changed successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "failed to change password",
    });
  }
};
