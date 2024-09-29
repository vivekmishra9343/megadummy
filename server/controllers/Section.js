const Section = require("../models/Section");
const Course = require("../models/Course");
// create sectiuon
exports.createSection = async (res, req) => {
  try {
    // data fecjh
    const { courseId, sectionName } = req.body;
    // data validaon
    if (!courseId || !sectionName) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }

    // create section
    const newSection = await Section.create({ sectionName });

    // update couse with sectuion objecID
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { sections: newSection._id },
      },
      { new: true }
    )
      .populate("sections")
      .exec();

    // H.W
    // use populate in such a way such that both section and subsections can be populated
    // use populate to replace sections/ sub-sections both in the updatedCourseDetails

    //  retunr rsponse
    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: updatedCourseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "eror creating sectiobns",
      error: error.message,
    });
  }
};

// updaate section
exports.updateSection = async (res, req) => {
  try {
    // data input
    const { sectionId, sectionName } = req.body;

    // data validatio
    if (!sectionId || !sectionName) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }

    // update data
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    // return response
    return res.status(201).json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error updating section",
      error: err.message,
    });
  }
};

// delete section
exports.deleteSection = async (res, req) => {
  try {
    // get id-assuming thtat we are sending id in paramas
    const { sectionId } = req.params;

    // use find by id and delete
    await Section.findByIdAndDelete(sectionId);

    //  delete the entry from course schema
    const course = await Course.findOneAndUpdate(
      { sectionId },
      { $pull: { sections: sectionId } },
      { new: true }
    );

    // return response
    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error deleting section",
      error: err.message,
    });
  }
};
