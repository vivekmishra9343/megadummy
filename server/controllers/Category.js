const Category = require("../models/Category");

// create category ka handler function

exports.createCategories = async (res, req) => {
  try {
    const { name, description } = req.body;

    if (!name || !!description) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // create and entry in db
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    console.log(categoryDetails);

    // return resposne
    res.status(201).json({
      message: "Category created successfully",
      category: categoryDetails,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error in creating category" });
  }
};

// getall categories
exports.showAllCategories = async (res, req) => {
  try {
    const allCategoriess = await Category.findAll(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      success: true,
      message: "all categories retun succesfuly",
      data: allCategoriess,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Error in fetching categories",
    });
  }
};

// category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    // get categoryID
    const { categoryId } = req.body;
    // get curses for specific categoryid
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();

    // validation
    if (!selectedCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    // get courses for different categoies
    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate("courses")
      .exec();

    // HW
    // get top 10 selling courses

    // retrun response
    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategories,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      message: "error while getting courses",
      success: false,
    });
  }
};
