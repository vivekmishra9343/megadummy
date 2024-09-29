const mongoose = require("mongoose");
const subSection = require("./subSection");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },
  courseDescription: {
    type: String,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Assuming you have an Instructor model
    required: true,
  },
  whatYouWillLearn: {
    type: String, // Array of strings for different learning outcomes
    required: true,
  },
  sections: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview", // Assuming you have a RatingAndReview model
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, // Array of strings for different categories
    required: true,
    ref: "Category",
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Assuming you have a User model
    },
  ],
  instructions: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
  },
});

module.exports = mongoose.model("Course", courseSchema);
