const Category = require("../models/category");


const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().select("name description image");
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCategoryByName = async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.name });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getCategories, getCategoryByName };
