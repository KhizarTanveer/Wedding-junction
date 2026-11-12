const Vendor = require("../models/vendor");


const ROLE_PERMISSIONS = {
  user: {
    booking: ["create", "read_own", "update_own", "cancel_own"],
    vendor: ["read"],
    conversation: ["create", "read_own", "update_own"],
    review: ["create", "read", "update_own", "delete_own"],
    profile: ["read_own", "update_own"],
  },
  vendor: {
    booking: ["read_assigned", "update_assigned", "accept", "decline", "complete"],
    vendor: ["read"],
    conversation: ["read_assigned", "update_assigned"],
    review: ["read", "respond"],
    profile: ["read_own", "update_own"],
    analytics: ["read_own"],
  },
  admin: {
    "*": ["*"], 
  },
};

/**
 * Check if user has permission for a resource action
 * @param {Object} user - User object
 * @param {string} resource - Resource name
 * @param {string} action - Action to perform
 * @returns {boolean}
 */
const checkPermission = (user, resource, action) => {
  
  if (user.role === "admin") return true;

 
  const rolePerms = ROLE_PERMISSIONS[user.role] || {};
  const resourcePerms = rolePerms[resource] || [];

  if (resourcePerms.includes(action) || resourcePerms.includes("*")) {
    return true;
  }

 
  if (user.permissions && user.permissions.length > 0) {
    const customPerm = user.permissions.find(
      (p) =>
        p.resource === resource &&
        p.actions.includes(action) &&
        (!p.expiresAt || new Date(p.expiresAt) > new Date())
    );
    if (customPerm) return true;
  }

  return false;
};

/**
 * Authorization middleware factory
 * @param {string} resource - Resource being accessed
 * @param {string} action - Action being performed
 * @param {Object} options - Additional options
 * @returns {Function} Express middleware
 */
const authorize = (resource, action, options = {}) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      if (user.accountStatus && user.accountStatus !== "active") {
        return res.status(403).json({
          status: "error",
          message: `Account is ${user.accountStatus}`,
        });
      }

     
      if (user.role === "admin") {
        return next();
      }

     
      if (options.requireVendor || options.requireActiveVendor) {
        if (user.role !== "vendor") {
          return res.status(403).json({
            status: "error",
            message: "Vendor access required",
          });
        }

       
        const vendor = await Vendor.findOne({ owner: user._id });

        if (!vendor) {
          return res.status(403).json({
            status: "error",
            message: "No vendor profile found",
          });
        }

        if (options.requireActiveVendor && vendor.status !== "active") {
          return res.status(403).json({
            status: "error",
            message: "Active vendor profile required",
          });
        }

        
        req.vendor = vendor;
      }

     
      if (!checkPermission(user, resource, action)) {
        return res.status(403).json({
          status: "error",
          message: `Permission denied: ${action} on ${resource}`,
        });
      }

      
      if (options.checkOwnership) {
        const isOwner = await options.checkOwnership(req);
        if (!isOwner) {
          return res.status(403).json({
            status: "error",
            message: "Access denied: You do not own this resource",
          });
        }
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({
        status: "error",
        message: "Authorization check failed",
      });
    }
  };
};

/**
 * Check if user owns a booking
 * @param {Object} req - Express request
 * @param {string} bookingIdParam - Request param name for booking ID
 * @returns {Function} Ownership check function
 */
const ownsBooking = (bookingIdParam = "id") => {
  return async (req) => {
    const Booking = require("../models/booking");
    const bookingId = req.params[bookingIdParam];
    const booking = await Booking.findById(bookingId);

    if (!booking) return false;

   
    if (booking.user.toString() === req.user._id.toString()) {
      return true;
    }

   
    if (req.vendor && booking.vendor.toString() === req.vendor._id.toString()) {
      return true;
    }

    return false;
  };
};

/**
 * Check if user owns a vendor profile
 * @param {Object} req - Express request
 * @param {string} vendorIdParam - Request param name for vendor ID
 * @returns {Function} Ownership check function
 */
const ownsVendor = (vendorIdParam = "id") => {
  return async (req) => {
    const Vendor = require("../models/vendor");
    const vendorId = req.params[vendorIdParam];
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) return false;

    return vendor.owner.toString() === req.user._id.toString();
  };
};

/**
 * Check if user owns a review
 * @param {Object} req - Express request
 * @param {string} reviewIdParam - Request param name for review ID
 * @returns {Function} Ownership check function
 */
const ownsReview = (reviewIdParam = "id") => {
  return async (req) => {
    const Review = require("../models/review");
    const reviewId = req.params[reviewIdParam];
    const review = await Review.findById(reviewId);

    if (!review) return false;

    return review.reviewer.toString() === req.user._id.toString();
  };
};

/**
 * Require specific role(s)
 * @param  {...string} roles - Required roles
 * @returns {Function} Express middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};


const requireAdmin = requireRole("admin");


const requireVendor = requireRole("vendor", "admin");

const requireActiveVendor = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
  }

  if (req.user.role === "admin") {
    return next();
  }

  if (req.user.role !== "vendor") {
    return res.status(403).json({
      status: "error",
      message: "Vendor access required",
    });
  }

  try {
    const vendor = await Vendor.findOne({ owner: req.user._id });

    if (!vendor) {
      return res.status(403).json({
        status: "error",
        message: "No vendor profile found",
      });
    }

    if (vendor.status !== "active") {
      return res.status(403).json({
        status: "error",
        message: `Vendor profile is ${vendor.status}`,
      });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error checking vendor status",
    });
  }
};

module.exports = {
  authorize,
  checkPermission,
  ownsBooking,
  ownsVendor,
  ownsReview,
  requireRole,
  requireAdmin,
  requireVendor,
  requireActiveVendor,
  ROLE_PERMISSIONS,
};
