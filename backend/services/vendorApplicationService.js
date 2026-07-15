const VendorApplication = require("../models/vendorApplication");
const Vendor = require("../models/vendor");
const User = require("../models/user");
const Category = require("../models/category");

/**
 * Vendor Application Service
 * Handles vendor application workflow
 */

class VendorApplicationService {
  /**
   * Submit a new vendor application
   * @param {string} userId - User ID
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Created application
   */
  static async submitApplication(userId, applicationData) {
    // Check if user already has a pending/approved application
    const existingApplication = await VendorApplication.findOne({
      applicant: userId,
      status: { $in: ["draft", "submitted", "under_review", "documents_pending", "approved"] },
    });

    if (existingApplication) {
      throw new Error("You already have an active vendor application");
    }

    // Validate category exists
    const category = await Category.findById(applicationData.serviceDetails.category);
    if (!category) {
      throw new Error("Invalid service category");
    }

    // Create application
    const application = new VendorApplication({
      applicant: userId,
      ...applicationData,
      status: "submitted",
      submittedAt: new Date(),
      termsAcceptedAt: new Date(),
    });

    // Add initial status to history
    application._statusChangedBy = userId;
    await application.save();

    // Update user reference
    await User.findByIdAndUpdate(userId, {
      vendorApplication: application._id,
    });

    return application;
  }

  /**
   * Save application as draft
   * @param {string} userId - User ID
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Draft application
   */
  static async saveDraft(userId, applicationData) {
    let application = await VendorApplication.findOne({
      applicant: userId,
      status: "draft",
    });

    if (application) {
      // Update existing draft
      Object.assign(application, applicationData);
      await application.save();
    } else {
      // Create new draft
      application = new VendorApplication({
        applicant: userId,
        ...applicationData,
        status: "draft",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
      await application.save();

      // Update user reference
      await User.findByIdAndUpdate(userId, {
        vendorApplication: application._id,
      });
    }

    return application;
  }

  /**
   * Get application by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Application or null
   */
  static async getApplicationByUser(userId) {
    return VendorApplication.findOne({ applicant: userId })
      .populate("serviceDetails.category", "name slug")
      .populate("review.assignedTo", "name email")
      .populate("review.reviewedBy", "name email")
      .sort({ createdAt: -1 });
  }

  /**
   * Get application by ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object|null>} Application or null
   */
  static async getApplicationById(applicationId) {
    return VendorApplication.findById(applicationId)
      .populate("applicant", "name email phone")
      .populate("serviceDetails.category", "name slug")
      .populate("review.assignedTo", "name email")
      .populate("review.reviewedBy", "name email");
  }

  /**
   * Get all applications with filters
   * @param {Object} filters - Query filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Applications and total count
   */
  static async getApplications(filters = {}, pagination = {}) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query["serviceDetails.category"] = filters.category;
    }

    if (filters.assignedTo) {
      query["review.assignedTo"] = filters.assignedTo;
    }

    if (filters.search) {
      query.$or = [
        { "businessInfo.name": { $regex: filters.search, $options: "i" } },
        { "contact.email": { $regex: filters.search, $options: "i" } },
      ];
    }

    const { page = 1, limit = 10, sort = "-createdAt" } = pagination;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      VendorApplication.find(query)
        .populate("applicant", "name email")
        .populate("serviceDetails.category", "name")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      VendorApplication.countDocuments(query),
    ]);

    return {
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Assign application to admin for review
   * @param {string} applicationId - Application ID
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} Updated application
   */
  static async assignApplication(applicationId, adminId) {
    const application = await VendorApplication.findById(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (!["submitted", "under_review"].includes(application.status)) {
      throw new Error("Application cannot be assigned in current status");
    }

    application.review = application.review || {};
    application.review.assignedTo = adminId;
    application.review.assignedAt = new Date();

    if (application.status === "submitted") {
      application.transitionTo("under_review", adminId);
    }

    await application.save();
    return application;
  }

  /**
   * Update verification checklist
   * @param {string} applicationId - Application ID
   * @param {string} adminId - Admin user ID
   * @param {Object} checklist - Checklist updates
   * @returns {Promise<Object>} Updated application
   */
  static async updateChecklist(applicationId, adminId, checklist) {
    const application = await VendorApplication.findById(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    application.review = application.review || {};
    application.review.verificationChecklist = {
      ...application.review.verificationChecklist,
      ...checklist,
    };

    await application.save();
    return application;
  }

  /**
   * Request additional documents
   * @param {string} applicationId - Application ID
   * @param {string} adminId - Admin user ID
   * @param {string} notes - Notes about required documents
   * @returns {Promise<Object>} Updated application
   */
  static async requestDocuments(applicationId, adminId, notes) {
    const application = await VendorApplication.findById(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.status !== "under_review") {
      throw new Error("Can only request documents for applications under review");
    }

    application.review = application.review || {};
    application.review.reviewNotes = notes;
    application.transitionTo("documents_pending", adminId, {
      reason: "Additional documents required",
      notes,
    });

    await application.save();
    return application;
  }

  /**
   * Approve vendor application
   * @param {string} applicationId - Application ID
   * @param {string} adminId - Admin user ID
   * @param {Object} options - Approval options
   * @returns {Promise<Object>} Created vendor profile
   */
  static async approveApplication(applicationId, adminId, options = {}) {
    const application = await VendorApplication.findById(applicationId).populate(
      "applicant"
    );

    if (!application) {
      throw new Error("Application not found");
    }

    if (!["under_review", "documents_pending"].includes(application.status)) {
      throw new Error("Application cannot be approved in current status");
    }

    // Transition application to approved
    application.review = application.review || {};
    application.review.reviewedBy = adminId;
    application.review.reviewedAt = new Date();
    application.review.reviewNotes = options.notes;
    application.transitionTo("approved", adminId, {
      reason: "Application approved",
      notes: options.notes,
    });

    // Create vendor profile
    const vendor = await this.createVendorFromApplication(application);

    // Update application with vendor reference
    application.vendorProfile = vendor._id;
    await application.save();

    // Update user role and references
    await User.findByIdAndUpdate(application.applicant._id, {
      role: "vendor",
      vendorProfile: vendor._id,
      vendorTier: options.tier || "basic",
    });

    return { application, vendor };
  }

  /**
   * Create vendor profile from application
   * @param {Object} application - Application document
   * @returns {Promise<Object>} Created vendor
   */
  static async createVendorFromApplication(application) {
    const vendor = new Vendor({
      owner: application.applicant._id || application.applicant,
      application: application._id,
      status: "active",

      // Business info
      businessInfo: {
        name: application.businessInfo.name,
        description: application.businessInfo.description,
      },
      name: application.businessInfo.name,
      description: application.businessInfo.description,

      // Service
      service: application.serviceDetails.servicesOffered[0] || "General",
      category: application.serviceDetails.category,
      servicesOffered: application.serviceDetails.servicesOffered,

      // Pricing
      price: application.serviceDetails.pricing.minPrice,
      pricing: {
        basePrice: application.serviceDetails.pricing.minPrice,
        minPrice: application.serviceDetails.pricing.minPrice,
        maxPrice: application.serviceDetails.pricing.maxPrice,
        negotiable: true,
      },

      // Contact
      contact: {
        phone: application.contact.phone,
        alternatePhone: application.contact.alternatePhone,
        email: application.contact.email,
        website: application.contact.website,
        socialMedia: application.contact.socialMedia,
      },

      // Location
      location: `${application.location.city}, ${application.location.state}`,
      locationDetails: {
        city: application.location.city,
        state: application.location.state,
        address: application.location.address,
        pincode: application.location.pincode,
      },
      serviceAreas: application.location.serviceAreas?.map((city) => ({ city })) || [],

      // Experience
      experience: `${application.serviceDetails.experience} years`,
      experienceDetails: {
        years: application.serviceDetails.experience,
        eventsCompleted: 0,
      },

      // Default image (can be updated later)
      image: application.portfolio?.[0]?.images?.[0] || "/default-vendor.jpg",

      // Initial metrics
      metrics: {
        responseRate: 100,
        bookingAcceptRate: 100,
        completionRate: 100,
        totalRevenue: 0,
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        profileViews: 0,
        inquiries: 0,
      },

      // Add "new" badge
      badges: [
        {
          type: "new",
          earnedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      ],
    });

    await vendor.save();
    return vendor;
  }

  /**
   * Reject vendor application
   * @param {string} applicationId - Application ID
   * @param {string} adminId - Admin user ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} Updated application
   */
  static async rejectApplication(applicationId, adminId, reason) {
    const application = await VendorApplication.findById(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (!["under_review", "documents_pending"].includes(application.status)) {
      throw new Error("Application cannot be rejected in current status");
    }

    application.review = application.review || {};
    application.review.reviewedBy = adminId;
    application.review.reviewedAt = new Date();
    application.review.rejectionReason = reason;
    application.transitionTo("rejected", adminId, { reason });

    await application.save();
    return application;
  }

  /**
   * Allow user to reapply after rejection
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Whether user can reapply
   */
  static async canReapply(userId) {
    const lastRejection = await VendorApplication.findOne({
      applicant: userId,
      status: "rejected",
    }).sort({ rejectedAt: -1 });

    if (!lastRejection) return true;

    // Allow reapply after 30 days
    const cooldownPeriod = 30 * 24 * 60 * 60 * 1000;
    const cooldownExpired =
      Date.now() - new Date(lastRejection.rejectedAt).getTime() > cooldownPeriod;

    return cooldownExpired;
  }

  /**
   * Get application statistics
   * @returns {Promise<Object>} Statistics
   */
  static async getStatistics() {
    const stats = await VendorApplication.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      draft: 0,
      submitted: 0,
      under_review: 0,
      documents_pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }
}

module.exports = VendorApplicationService;
