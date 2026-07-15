const express = require("express");
const router = express.Router();
const { validate } = require("../middlewares/validateMiddleware");
const protect = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  applyAsVendor,
  getApplicationStatus,
  resetTestUsers,
} = require("../controllers/authController");

// Public routes
router.post("/signup", validate("signup"), signup);
router.post("/login", validate("login"), login);
router.post("/forgot-password", validate("forgotPassword"), forgotPassword);
router.post("/reset-password/:token", validate("resetPassword"), resetPassword);

// Test-only route to reset test user account locks (only works in test/development mode)
router.post("/reset-test-users", resetTestUsers);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/profile/avatar", protect, ...uploadMiddleware.userAvatar, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);

// Vendor application routes
router.post("/apply-vendor", protect, applyAsVendor);
router.get("/application-status", protect, getApplicationStatus);

module.exports = router;
