const Vendor = require("../models/vendor");
const Category = require("../models/category");
const Service = require("../models/service");
const User = require("../models/user");
const Booking = require("../models/booking");
const VendorApplication = require("../models/vendorApplication");
const { sendVendorApprovalEmail } = require("../utils/sendEmail");

// ==================== DASHBOARD ====================

const getDashboardStats = async (req, res) => {
  try {
    // Count pending applications from VendorApplication model
    const pendingApplicationsCount = await VendorApplication.countDocuments({
      status: { $in: ["submitted", "under_review", "documents_pending"] },
    });

    const [vendors, categories, services, users, bookings] = await Promise.all([
      Vendor.countDocuments(),
      Category.countDocuments(),
      Service.countDocuments(),
      User.countDocuments(),
      Booking.countDocuments(),
    ]);

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("userName service price isConfirmed createdAt");

    // Get pending vendor applications from VendorApplication model
    const pendingApplicationsRaw = await VendorApplication.find({
      status: { $in: ["submitted", "under_review", "documents_pending"] },
    })
      .populate("applicant", "name email")
      .populate("serviceDetails.category", "name")
      .sort({ submittedAt: -1 })
      .limit(10);

    // Format for frontend compatibility
    const pendingVendorApplications = pendingApplicationsRaw.map((app) => ({
      _id: app.applicant?._id || app._id,
      name: app.applicant?.name || "Unknown",
      email: app.applicant?.email || "Unknown",
      vendorApplication: {
        applicationId: app._id,
        status: app.status,
        businessName: app.businessInfo?.name,
        businessDescription: app.businessInfo?.description,
        serviceCategory: app.serviceDetails?.category?.name || "Unknown",
        appliedAt: app.submittedAt || app.createdAt,
      },
    }));

    return res.status(200).json({
      status: "success",
      data: {
        counts: { vendors, categories, services, users, bookings, pendingApplications: pendingApplicationsCount },
        recentBookings,
        pendingVendorApplications,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard stats",
    });
  }
};

// ==================== VENDORS ====================

// Whitelist allowed vendor fields
const VENDOR_ALLOWED_FIELDS = [
  "name", "service", "category", "description", "image", "images",
  "price", "location", "contact", "isFeatured", "isAvailable",
  "rating", "reviewCount", "pricing", "portfolio", "experience",
  "specializations", "serviceAreas"
];

// Helper to filter object to allowed fields only
const filterObject = (obj, allowedFields) => {
  const filtered = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
};

const createVendor = async (req, res) => {
  try {
    const filteredBody = filterObject(req.body, VENDOR_ALLOWED_FIELDS);
    const vendor = await Vendor.create(filteredBody);
    return res.status(201).json({
      status: "success",
      data: vendor,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to create vendor",
    });
  }
};

const updateVendor = async (req, res) => {
  try {
    const filteredBody = filterObject(req.body, VENDOR_ALLOWED_FIELDS);

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: filteredBody },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: vendor,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to update vendor",
    });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete vendor",
    });
  }
};

// ==================== CATEGORIES ====================

// Whitelist allowed category fields
const CATEGORY_ALLOWED_FIELDS = ["name", "description", "image", "icon", "isActive", "sortOrder"];

const createCategory = async (req, res) => {
  try {
    const filteredBody = filterObject(req.body, CATEGORY_ALLOWED_FIELDS);
    const category = await Category.create(filteredBody);
    return res.status(201).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to create category",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const filteredBody = filterObject(req.body, CATEGORY_ALLOWED_FIELDS);

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: filteredBody },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to update category",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    // Check if any vendors use this category
    const vendorsUsingCategory = await Vendor.countDocuments({
      category: req.params.id,
    });

    if (vendorsUsingCategory > 0) {
      return res.status(400).json({
        status: "error",
        message: `Cannot delete: ${vendorsUsingCategory} vendors are using this category`,
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete category",
    });
  }
};

// ==================== VENDOR APPLICATIONS ====================

const getVendorApplications = async (req, res) => {
  try {
    const { status = "submitted" } = req.query;

    const query = {};
    if (status !== "all") {
      // Support both "pending" and "submitted" for backwards compatibility
      if (status === "pending") {
        query["vendorApplication.status"] = { $in: ["pending", "submitted"] };
      } else {
        query["vendorApplication.status"] = status;
      }
    } else {
      query["vendorApplication.status"] = { $nin: ["none", null, undefined] };
    }

    const applications = await User.find(query)
      .select("name email phone vendorApplication createdAt")
      .sort({ "vendorApplication.appliedAt": -1 });

    return res.status(200).json({
      status: "success",
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch vendor applications",
    });
  }
};

const approveVendorApplication = async (req, res) => {
  try {
    // First try to find by user ID (for backwards compatibility)
    let user = await User.findById(req.params.id);
    let application = null;

    if (user && user.vendorApplication) {
      // Find application by reference in user
      application = await VendorApplication.findById(user.vendorApplication);
    }

    // If not found by user, try finding by application ID directly
    if (!application) {
      application = await VendorApplication.findById(req.params.id);
      if (application) {
        user = await User.findById(application.applicant);
      }
    }

    if (!application) {
      return res.status(404).json({
        status: "error",
        message: "Application not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Accept submitted, under_review, or documents_pending statuses
    const validStatuses = ["submitted", "under_review", "documents_pending"];
    if (!validStatuses.includes(application.status)) {
      return res.status(400).json({
        status: "error",
        message: "Application is not in a reviewable status",
      });
    }

    // Category is stored in application
    const categoryId = application.serviceDetails?.category || null;

    // Build vendor data from application
    const vendorData = {
      owner: user._id,
      application: application._id,
      status: "active",
      // Business Info
      businessInfo: {
        name: application.businessInfo?.name,
        description: application.businessInfo?.description,
      },
      // Legacy fields for backward compatibility
      name: application.businessInfo?.name,
      service: application.serviceDetails?.servicesOffered?.[0] || "General",
      category: categoryId,
      description: application.businessInfo?.description,
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      // Pricing
      price: application.serviceDetails?.pricing?.minPrice || 0,
      pricing: {
        minPrice: application.serviceDetails?.pricing?.minPrice || 0,
        maxPrice: application.serviceDetails?.pricing?.maxPrice || 0,
        negotiable: true,
      },
      // Contact
      contact: {
        phone: application.contact?.phone || "",
        alternatePhone: application.contact?.alternatePhone || "",
        email: application.contact?.email || user.email,
        website: application.contact?.website || "",
        socialMedia: {
          instagram: application.contact?.socialMedia?.instagram || "",
          facebook: application.contact?.socialMedia?.facebook || "",
          youtube: application.contact?.socialMedia?.youtube || "",
        },
      },
      // Location
      location: application.location?.city || "",
      locationDetails: {
        address: application.location?.address || "",
        city: application.location?.city || "",
        state: application.location?.state || "",
        pincode: application.location?.pincode || "",
      },
      serviceAreas: (application.location?.serviceAreas || []).map((area) => ({
        city: area,
        state: application.location?.state || "",
      })),
      // Experience
      experience: application.serviceDetails?.experience ? `${application.serviceDetails.experience} years` : "",
      experienceDetails: {
        years: application.serviceDetails?.experience || 0,
        eventsCompleted: 0,
        highlights: [],
      },
      servicesOffered: application.serviceDetails?.servicesOffered || [],
      isAvailable: true,
      availability: {
        isAvailable: true,
      },
    };

    // Create vendor profile
    const vendor = await Vendor.create(vendorData);

    // Update VendorApplication
    application.status = "approved";
    application.approvedAt = new Date();
    application.review = {
      ...application.review,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    };
    application.vendorProfile = vendor._id;
    await application.save();

    // Update user
    user.role = "vendor";
    user.vendorProfile = vendor._id;
    await user.save();

    // Send approval email
    const vendorName = vendor.name || vendor.businessInfo?.name || "Vendor";
    sendVendorApprovalEmail(user.email, vendorName).catch((err) => {
      console.error("Failed to send vendor approval email:", err.message);
    });

    return res.status(200).json({
      status: "success",
      message: "Vendor application approved",
      vendor,
    });
  } catch (error) {
    console.error("Approve vendor application error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to approve application",
    });
  }
};

const rejectVendorApplication = async (req, res) => {
  try {
    const { reason } = req.body;

    // First try to find by user ID (for backwards compatibility)
    let user = await User.findById(req.params.id);
    let application = null;

    if (user && user.vendorApplication) {
      application = await VendorApplication.findById(user.vendorApplication);
    }

    // If not found by user, try finding by application ID directly
    if (!application) {
      application = await VendorApplication.findById(req.params.id);
      if (application) {
        user = await User.findById(application.applicant);
      }
    }

    if (!application) {
      return res.status(404).json({
        status: "error",
        message: "Application not found",
      });
    }

    // Accept submitted, under_review, or documents_pending statuses
    const validStatuses = ["submitted", "under_review", "documents_pending"];
    if (!validStatuses.includes(application.status)) {
      return res.status(400).json({
        status: "error",
        message: "Application is not in a reviewable status",
      });
    }

    // Update application status
    application.status = "rejected";
    application.rejectedAt = new Date();
    application.review = {
      ...application.review,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      rejectionReason: reason || "Application rejected",
    };
    await application.save();

    return res.status(200).json({
      status: "success",
      message: "Vendor application rejected",
    });
  } catch (error) {
    console.error("Reject application error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to reject application",
    });
  }
};

// ==================== SERVICES ====================

const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    return res.status(201).json({
      status: "success",
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to create service",
    });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to update service",
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Service deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete service",
    });
  }
};

module.exports = {
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
};
