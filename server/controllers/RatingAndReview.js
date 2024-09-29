const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

// create review
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    // fetch data from request body
    const { rating, review, course_id } = req.body;

    // check if user is enrolled or not
    const courseDetails = await Course.findOne({
      _id: course_id,
      students: userId,
    });
    if (!courseDetails) {
      return res
        .status(400)
        .json({ message: "You are not enrolled in this course" });
    }

    // validate the input
    if (!rating || !review || !course_id || !userId) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    // check for already review in db
    const alreadyReviewed = await RatingAndReview.findOne({
      where: { userId, course_id },
    });

    if (!alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this course" });
    }

    // save the review
    const newReview = await RatingAndReview.create({
      rating,
      review,
      course: course_id,
      user: userId,
    });

    //    add newReview to course model

    Course.ratingAndReviews.push(newReview._id);
    await Course.save();

    // return response

    return res.status(200).json({
      success: true,
      message: "Review created successfully",
      data: newReview,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get All Reviews for a Course
exports.getCourseReviews = async (req, res) => {
  try {
    // fetch details
    const { courseId } = req.params;

    // find the details
    const reviews = await RatingAndReview.find({ course: courseId })
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    res.status(200).json({ reviews });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};

// update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userId = req.user.id;
    const { reviewId } = req.params;

    // Find and update the review if it belongs to the user
    const updatedReview = await RatingAndReview.findOneAndUpdate(
      { _id: reviewId, user: userId },
      { rating, review },
      { new: true }
    );

    if (!updatedReview) {
      return res
        .status(404)
        .json({ message: "Review not found or you're not authorized" });
    }

    res
      .status(200)
      .json({ message: "Review updated successfully", updatedReview });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating review", error: error.message });
  }
};

// delete a revie
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const review = await RatingAndReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    await RatingAndReview.findOneAndDelete({ _id: reviewId, user: userId });

    // return response
    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting review", error: err.message });
  }
};

// Get Average Rating for a Course
exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const avgRating = await RatingAndReview.aggregate([
      {
        $match: { course: mongoose.Types.ObjectId(courseId) }, //convertinf string to object id
        $group: { _id: "$course", averageRating: { $avg: "$rating" } },
      },
    ]);

    // retrurn reponse

    if (avgRating > 0) {
      res.status(200).json({
        success: true,
        message: "rating retrieved succesfuilly",
        average: avgRating[0].averageRating,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "No ratings yet",
        average: 0,
      });
    }
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Error getting average rating" });
  }
};
