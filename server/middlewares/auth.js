const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth middleware
exports.auth = async (req, res, next) => {
  try {
    // extract token from Authorization header, body, or cookies
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.body.token ||
      req.cookies.token;

    // if token is missing, return a 401 response
    if (!token) {
      return res.status(401).json({ success: false, error: "Token missing" });
    }

    // verify the token
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log(decoded); // optional: for debugging
      req.user = decoded; // store the decoded user information in req.user
    } catch (error) {
      return res.status(400).json({ success: false, error: "Invalid token" });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Token missing or invalid",
    });
  }
};

// isStudent middleware
exports.isStudent = (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Students only",
      });
    }
    next(); // user is a student, proceed to the next middleware
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

// isInstructor middleware
exports.isInstructor = (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Instructors only",
      });
    }
    next(); // user is an instructor, proceed to the next middleware
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

// isAdmin middleware
exports.isAdmin = (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admins only",
      });
    }
    next(); // user is an admin, proceed to the next middleware
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};
