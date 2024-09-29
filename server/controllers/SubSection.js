const Section = require("../models/Section");
const subSection = require("../models/subSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create subsection
exports.createSubSection = async (req, res) => {
  try {
    // fetch data fro request body
    const { sectionId, title, timeDuraton, description } = req.body;
    // extract file/video
    const video = req.files.videoFile;
    // validation
    if (!sectionId || !title || !timeDuraton || !description || !video)
      return res.status(400).json({ message: "Please fill all fields" });
    // uplaod video to cloduinar
    const uploadVideo = await cloudinary.uploader.upload(
      video,
      process.env.FOLDER_NAME
    );
    // create a subsection
    const subSectionDetails = await subSection.create({
      sectionId,
      title,
      timeDuraton,
      description,
      videoUrl: uploadVideo.secure_url,
    });

    // update section with this subsection
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: {
          subSections: subSectionDetails._id,
        },
      },
      { new: true }
    );
    // H.W - log updated sectio here after Adding poplulate query

    // return response
    res.status(201).json({
      success: true,
      message: "Subsection created successfully",
      updatedSection: updatedSection,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Error creating subsection",
      error: err.message,
    });
  }
};

// Hw -update subsection

const updateSubSection = async (req, res) => {
  try {
    // get the subsection id from the request
    const subsectionId = req.body;

    // fetch the data fromt the request
    const { title, timeDuraton, description, videoUrl } = req.body;

    // validation
    if (!title || !timeDuraton || !description || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // save the updated data using the nsubsection id
    const updatedSubSection = await subSection.findByIdAndUpdate(
      subsectionId,
      {
        title,
        timeDuraton,
        description,
        videoUrl,
      },
      { new: true }
    );

    // return resposne
    res.status(200).json({
      success: true,
      message: "Subsection updated successfully",
      updatedSubSection: updatedSubSection,
    });
  } catch (err) {
    console.log(err);
    return res.json(500)({
      success: false,
      message: "Error updating subsection",
    });
  }
};

// hw- delete subsction
const deleteSubSection = async (req, res) => {
  try {
    // get the section and subsection id from the request
    const { sectionId, subsectionId } = req.body;

    // delete the subsection from the subsection model
    await subSection.findByIdAndDelete(subsectionId);

    // delete thee subsection fromthe sections
    await Section.findByIdAndUpdate(
      sectionId,
      {
        $pull: {
          subsections: subsectionId,
        },
      },
      { new: true }
    );
    // return resposne
    res.status(200).json({
      success: true,
      message: "Subsection deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.json(500)({
      success: false,
      message: "Error deleting subsection",
    });
  }
};
