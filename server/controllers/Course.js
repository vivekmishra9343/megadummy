const Course = require("../models/Course");

const Category = require("../models/Category");
const User = require("../models/User");
const imageUploader = require("../utils/imageUploader");
const { populate } = require("../models/RatingAndReview");

// create course
exports.createCourse = async (req, res) => {
  try {
    // fetch data
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;
    const thumbnail = req.files.thumbnail;

    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
      !thumbnail
    ) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // check for instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    // TODO :verify that userID and instucpotr details are same or different
    console.log("instructor details :", instructorDetails);
    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "isntructor details not found",
      });
    }

    // check given category is found or not
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }
    // uplaod iamge to cloudinary
    const uploadedThumbnail = await imageUploader.upload(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // CREATE AND ENTRY FOR NEW COURSE
    const newCourse = new Course({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      thumbnail: uploadedThumbnail.secure_url,
      price,
      category: categoryDetails._id,
      whatYouWillLearn,
    });

    // add the new course to the user schema of isntructor
    instructorDetails.courses.push(newCourse._id);

    // CHANGE this if necessary
    await instructorDetails.save({ new: true });

    //update the category schema
    categoryDetails.course.push(newCourse._id);
    await categoryDetails.save({ new: true });

    // save the new course
    await newCourse.save();

    // retun response
    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      successs: false,
      message: "Error creating course",
    });
  }
};

// get all courses
const getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();
    return res.status(200).json({
      success: true,
      message: "All courses retrieved successfully",
      data: allCourses,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: err.message,
    });
  }
};

// Get Course Details
const getCourseDetails = async (req, res) => {
  try {
    // Fetch course ID from request params
    const courseId = req.body;

    // Fetch course data from the database with populated fields
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("Category") // Populating with specific fields for better efficiency
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "SubSection", // Assuming Sections have lessons that need to be populated
        },
      })
      .populate("studentsEnrolled", "name") // Only populate specific fields for efficiency
      .exec();

    // validation
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Course not found with ${courseId} `,
      });
    }

    // Check if the course was found
    if (!courseDetails) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Send the course details in the response
    res
      .status(200)
      .json({
        success: true,
        message: "course details fetched succesfully",
        data: courseDetails,
      });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error fetching course details", error: err.message });
  }
};
