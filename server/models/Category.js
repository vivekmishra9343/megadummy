const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false, // This field is optional
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // Reference to the Course model
  },
});

module.exports = mongoose.model("Category", categorySchema);
