const Vendor = require("../models/vendor");

// Middleware to check if user is a vendor
const vendorOnly = async (req, res, next) => {
  if (req.user && req.user.role === "vendor") {
    // Verify vendor has an active vendor profile
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) {
      return res.status(403).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }
    // Attach vendor to request for easy access
    req.vendor = vendor;
    return next();
  }
  return res.status(403).json({
    status: "error",
    message: "Vendor access required",
  });
};

// Middleware to allow both vendor and admin access
const vendorOrAdmin = async (req, res, next) => {
  if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) {
    // If vendor, attach vendor profile
    if (req.user.role === "vendor") {
      const vendor = await Vendor.findOne({ owner: req.user._id });
      if (vendor) {
        req.vendor = vendor;
      }
    }
    return next();
  }
  return res.status(403).json({
    status: "error",
    message: "Vendor or admin access required",
  });
};

module.exports = { vendorOnly, vendorOrAdmin };
