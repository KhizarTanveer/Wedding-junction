const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { vendorOnly } = require("../middlewares/vendorMiddleware");
const { validateObjectId } = require("../middlewares/validateObjectId");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const {
  getVendorStats,
  getVendorProfile,
  updateVendorProfile,
  getVendorBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  getVendorConversations,
  uploadProfileImage,
  uploadGalleryImages,
  deleteGalleryImage,
} = require("../controllers/vendorDashboardController");

// All vendor dashboard routes require authentication + vendor role
router.get("/dashboard", protect, vendorOnly, getVendorStats);
router.get("/profile", protect, vendorOnly, getVendorProfile);
router.put("/profile", protect, vendorOnly, updateVendorProfile);

// Image upload routes
router.post("/profile/image", protect, vendorOnly, ...uploadMiddleware.vendorProfile, uploadProfileImage);
router.post("/gallery", protect, vendorOnly, ...uploadMiddleware.vendorGallery, uploadGalleryImages);
router.delete("/gallery/:publicId", protect, vendorOnly, deleteGalleryImage);

router.get("/bookings", protect, vendorOnly, getVendorBookings);
router.patch("/bookings/:id/accept", protect, vendorOnly, validateObjectId("id"), acceptBooking);
router.patch("/bookings/:id/reject", protect, vendorOnly, validateObjectId("id"), rejectBooking);
router.patch("/bookings/:id/complete", protect, vendorOnly, validateObjectId("id"), completeBooking);
router.get("/conversations", protect, vendorOnly, getVendorConversations);

module.exports = router;
