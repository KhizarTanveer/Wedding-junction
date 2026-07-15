const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminMiddleware");
const { validate } = require("../middlewares/validateMiddleware");
const { validateObjectId } = require("../middlewares/validateObjectId");

const {
  getDashboardStats,
  createVendor,
  updateVendor,
  deleteVendor,
  createCategory,
  updateCategory,
  deleteCategory,
  createService,
  updateService,
  deleteService,
  getVendorApplications,
  approveVendorApplication,
  rejectVendorApplication,
} = require("../controllers/adminController");

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard
router.get("/stats", getDashboardStats);

// Vendors
router.post("/vendors", validate("createVendor"), createVendor);
router.put("/vendors/:id", validateObjectId("id"), validate("updateVendor"), updateVendor);
router.delete("/vendors/:id", validateObjectId("id"), deleteVendor);

// Vendor Applications
router.get("/vendor-applications", getVendorApplications);
router.patch("/vendor-applications/:id/approve", validateObjectId("id"), approveVendorApplication);
router.patch("/vendor-applications/:id/reject", validateObjectId("id"), rejectVendorApplication);

// Categories
router.post("/categories", validate("createCategory"), createCategory);
router.put("/categories/:id", validateObjectId("id"), validate("updateCategory"), updateCategory);
router.delete("/categories/:id", validateObjectId("id"), deleteCategory);

// Services
router.post("/services", validate("createService"), createService);
router.put("/services/:id", validateObjectId("id"), validate("updateService"), updateService);
router.delete("/services/:id", validateObjectId("id"), deleteService);

module.exports = router;
