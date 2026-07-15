const express = require("express");
const router = express.Router();
const { validateObjectId } = require("../middlewares/validateObjectId");

const {
  getVendors,
  getVendorById,
  getFeaturedVendors,
  getVendorsByCategory,
} = require("../controllers/vendorController");

router.get("/vendors", getVendors);
router.get("/vendors/featured", getFeaturedVendors);
router.get("/vendors/category/:categoryName", getVendorsByCategory);
router.get("/vendors/:id", validateObjectId("id"), getVendorById);

module.exports = router;
