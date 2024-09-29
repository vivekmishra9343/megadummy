const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model
  },
  rating: {
    type: Number,
    required: true,
    min: 1, // Assuming rating is between 1 and 5
    max: 5,
  },
  review: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
    index: true,
  },
});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
