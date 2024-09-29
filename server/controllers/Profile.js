const Profile = require("./models/Profile"); // Import Profile model
const User = require("./models/User"); // Import User model

// Update profile function
exports.updateProfile = async (req, res) => {
  try {
    // Get data from the request body
    const { dateOfBirth, about, contactNumber, gender } = req.body;

    // Get user ID from the request
    const id = req.user.id;

    // Validate the input fields
    if (!dateOfBirth || !about || !contactNumber || !gender) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find user by ID
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get profile ID from the user details
    const profileId = userDetails.additionalDetails;
    if (!profileId) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Find profile by profile ID
    const profileDetails = await Profile.findById(profileId);
    if (!profileDetails) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Update profile fields
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    // Save the updated profile
    await profileDetails.save();

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profileDetails,
    });
  } catch (error) {
    // Handle errors and return a 500 response
    return res.status(500).json({
      success: false,
      message: "error while updating preofile details",
      error: error.message,
    });
  }
};

// delete account
exports.deleteAccount = async (req, res) => {
  try {
    // Get user ID from the request
    const userId = req.user._id;

    // validation
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
    // delete user
    await User.findByIdAndDelete({ _id: userId });
    // TODO : hw unenroll user from all enrolled courses
    // search for chrone job

    // hwo can we schedule a delete account job

    // return reponse
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error deleting account",
      error: error.message,
    });
  }
};

// get all user detals
exports.getAllUserDetails = async (req, res) => {
  try {
    // Get id from request user object
    const id = req.user.id;

    // Validate id and get user details
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    // If user not found, send a not found response
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return response with user details
    return res.status(200).json({
      success: true,
      message: "User Data Fetched Successfully",
      data: userDetails,
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
