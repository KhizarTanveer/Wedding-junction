const express = require("express");
const router = express.Router();

const {
  createReview,
  getVendorReviews,
  getReview,
  updateReview,
  deleteReview,
  addResponse,
  markHelpful,
  reportReview,
  moderateReview,
  getPendingReviews,
  getMyReviews,
} = require("../controllers/reviewController");

const protect = require("../middlewares/authMiddleware");
const { requireAdmin, requireActiveVendor } = require("../middlewares/authorize");

// Public routes
router.get("/vendors/:vendorId/reviews", getVendorReviews);
router.get("/:id", getReview);

// Protected routes (require authentication)
router.use(protect);

// User review routes
router.post("/", createReview);
router.get("/my/reviews", getMyReviews);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);
router.post("/:id/helpful", markHelpful);
router.post("/:id/report", reportReview);

// Vendor response route
router.post("/:id/response", requireActiveVendor, addResponse);

// Admin routes
router.get("/admin/pending", requireAdmin, getPendingReviews);
router.patch("/:id/moderate", requireAdmin, moderateReview);

module.exports = router;
