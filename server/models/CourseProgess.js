const mongoose = require("mongoose");

const CourseProgessSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  completedVideos: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subSection",
  },
});

module.exports = mongoose.model("CourseProgess", CourseProgessSchema);
