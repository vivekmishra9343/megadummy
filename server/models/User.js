const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  accountType: {
    type: String,
    required: true,
    enum: ["Admin", "Instructor", "Student"],
  },
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  courses: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  Images: {
    type: String,
    required: true,
  },
  courseProgess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseProgess",
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
