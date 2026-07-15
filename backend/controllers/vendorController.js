const Vendor = require("../models/vendor");
const Category = require("../models/category");

// Escape special regex characters to prevent ReDoS attacks
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// GET all vendors with pagination
const getVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 12, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Optional search and filter - escape regex special characters
    const search = req.query.search ? escapeRegex(req.query.search.trim()) : "";
    const categoryFilter = req.query.category || "";
    const minPrice = Math.max(0, parseInt(req.query.minPrice) || 0);
    const maxPrice = Math.min(parseInt(req.query.maxPrice) || Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (categoryFilter) {
      const category = await Category.findOne({ name: categoryFilter });
      if (category) {
        query.category = category._id;
      }
    }

    query.price = { $gte: minPrice, $lte: maxPrice };

    const total = await Vendor.countDocuments(query);
    const vendors = await Vendor.find(query)
      .populate("category", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch vendors",
    });
  }
};

// GET single vendor by ID
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor not found",
      });
    }
    res.status(200).json({
      status: "success",
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// GET featured vendors
const getFeaturedVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isFeatured: true }).populate(
      "category",
      "name"
    );
    res.status(200).json({
      status: "success",
      vendors,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// GET vendors by category name with pagination
const getVendorsByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const category = await Category.findOne({ name: req.params.categoryName });

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    const query = {
      category: category._id,
      isFeatured: false,
    };

    const total = await Vendor.countDocuments(query);
    const vendors = await Vendor.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1 });

    res.status(200).json({
      status: "success",
      vendors,
      category: {
        name: category.name,
        description: category.description,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch vendors",
    });
  }
};

module.exports = {
  getVendors,
  getVendorById,
  getFeaturedVendors,
  getVendorsByCategory,
};
