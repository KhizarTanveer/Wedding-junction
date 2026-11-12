const Vendor = require("../models/Vendor");


const vendorOnly = async (req, res, next) => {
  if (req.user && req.user.role === "vendor") {
    
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) {
      return res.status(403).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }
   
    req.vendor = vendor;
    return next();
  }
  return res.status(403).json({
    status: "error",
    message: "Vendor access required",
  });
};


const vendorOrAdmin = async (req, res, next) => {
  if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) {
    
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
