const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

// capture the payment and tinitiate the razorpay order

exports.capturePayment = async (req, res) => {
  // get course id and user id
  const { courseId } = req.body;
  const userId = req.body.id;

  // validation
  // valid course id
  if (!courseId) {
    return res.json({
      success: true,
      message: " please provide valid course id",
    });

    // valid course detail
    let course;
    try {
      course = await Course.findById(courseId);
      if (!course) {
        return res.json({
          success: false,
          message: "Course not found",
        });
      }
      // user already pay for he course
      const uid = mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res.json({
          success: false,
          message: "You have already enrolled for this course",
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: "Error while fetching course details",
        err: err.message,
      });
    }
    //order create
    const amount = course.price;

    const currency = "INR";

    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseId,
        userId,
      },
    };
    try {
      // initiate the payment using razorpay

      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);
      // return reponse
      return res.json({
        success: true,
        message: "order created successfully",
        courseName: Course.courseName,
        courseDescription: Course.courseDescription,
        thumbnail: Course.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "could not inintiate order",
        err: err.message,
      });
    }
  }
};

// verify signature

const verifySignature = async (req, res) => {
  const webhookSecret = "12345678";
  const signature = req.headers["x-razorpay—signature"];

  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (signature === digest) {
    console.log("payment authorised");

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      // ful fill the action
      // find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        {
          $push: { enrolledStudents: userId },
        },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.json({
          success: false,
          message: "could not enroll student",
          err: "course not found",
        });
      }

      console.log(enrolledCourse);

      //find the student and add the course in the enrolled courses
      const enrolledStudent = await Student.findOneAndUpdate(
        { _id: userId },
        {
          $push: { enrolledCourses: courseId },
        },
        { new: true }
      );

      console.log(enrolledStudent);

      // send mail of confirmation
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "congratulation from the studynotion",
        "congratulation for enrolling in  new course"
      );

      // return response
      return res.json({
        success: true,
        message: "signature verified and course added",
      });
    } catch (err) {
      console.log(err);
      message: err.message;
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "invalid signature",
    });
  }
};
