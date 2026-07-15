const mongoose = require("mongoose");

// Gallery image schema
const galleryImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    caption: String,
    order: {
      type: Number,
      default: 0,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Service offering schema
const serviceOfferingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    price: Number,
    pricingModel: {
      type: String,
      enum: ["fixed", "starting_from", "per_hour", "custom"],
      default: "fixed",
    },
    duration: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

// Service area schema
const serviceAreaSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
    },
    state: String,
    radius: Number, // in km
    travelCharges: Number,
  },
  { _id: false }
);

// Credential schema
const credentialSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["certification", "award", "membership", "training"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    issuer: String,
    year: Number,
    documentUrl: String,
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Badge schema
const badgeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["verified", "top_rated", "quick_responder", "new", "premium"],
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
  },
  { _id: false }
);

// Audit log entry schema
const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
  },
  { _id: false }
);

// Status history schema
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: String,
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    // Owner - the user who owns this vendor profile
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Vendor Application Reference
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorApplication",
    },

    // Status Management
    status: {
      type: String,
      enum: ["pending_setup", "active", "suspended", "deactivated", "under_review"],
      default: "pending_setup",
    },
    statusReason: String,
    statusChangedAt: Date,
    statusChangedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    statusHistory: [statusHistorySchema],

    // Business Information
    businessInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      slug: {
        type: String,
        unique: true,
        sparse: true,
      },
      tagline: {
        type: String,
        maxlength: 150,
      },
      description: {
        type: String,
        required: true,
      },
      logo: String,
      coverImage: String,
      gallery: [galleryImageSchema],
    },

    // Legacy fields for backward compatibility
    name: {
      type: String,
      required: true,
      trim: true,
    },
    service: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    details: String,
    experience: String,
    servicesOffered: [String],
    location: String,

    // Category & Services
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    services: [serviceOfferingSchema],

    // Pricing
    price: {
      type: Number,
      required: true,
    },
    pricing: {
      basePrice: Number,
      currency: {
        type: String,
        default: "INR",
      },
      minPrice: Number,
      maxPrice: Number,
      negotiable: {
        type: Boolean,
        default: true,
      },
      depositRequired: {
        type: Boolean,
        default: false,
      },
      depositPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    // Location & Service Areas
    locationDetails: {
      address: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: "India",
      },
      pincode: String,
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: [Number], // [longitude, latitude]
      },
    },
    serviceAreas: [serviceAreaSchema],

    // Contact
    contact: {
      phone: String,
      alternatePhone: String,
      email: String,
      website: String,
      whatsapp: String,
      socialMedia: {
        instagram: String,
        facebook: String,
        youtube: String,
        pinterest: String,
      },
    },

    // Experience & Credentials
    experienceDetails: {
      years: Number,
      eventsCompleted: {
        type: Number,
        default: 0,
      },
      highlights: [String],
    },
    credentials: [credentialSchema],

    // Availability
    availability: {
      isAvailable: {
        type: Boolean,
        default: true,
      },
      unavailableUntil: Date,
      unavailableReason: String,
      bookingLeadTime: {
        type: Number,
        default: 7,
      }, // days in advance
      maxBookingsPerDay: {
        type: Number,
        default: 1,
      },
      blockedDates: [Date],
      workingDays: {
        type: [String],
        default: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
      },
    },

    // Legacy availability field
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Ratings & Reviews (summary - actual reviews in Review model)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },

    // Legacy reviews (for backward compatibility)
    reviews: [
      {
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
      },
    ],

    // Performance Metrics
    metrics: {
      responseTime: {
        average: Number, // in minutes
        lastUpdated: Date,
      },
      responseRate: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
      },
      bookingAcceptRate: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
      },
      completionRate: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      totalBookings: {
        type: Number,
        default: 0,
      },
      completedBookings: {
        type: Number,
        default: 0,
      },
      cancelledBookings: {
        type: Number,
        default: 0,
      },
      profileViews: {
        type: Number,
        default: 0,
      },
      inquiries: {
        type: Number,
        default: 0,
      },
    },

    // Legacy response time
    responseTime: {
      average: Number,
      lastUpdated: Date,
    },

    // Badges & Verification
    badges: [badgeSchema],
    verification: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      level: {
        type: String,
        enum: ["basic", "enhanced", "premium"],
        default: "basic",
      },
    },

    // Listing Options
    isFeatured: {
      type: Boolean,
      default: false,
    },
    listing: {
      isFeatured: {
        type: Boolean,
        default: false,
      },
      featuredUntil: Date,
      priority: {
        type: Number,
        default: 0,
      },
      tags: [String],
      seoTitle: String,
      seoDescription: String,
    },

    // Vendor Settings
    settings: {
      autoAcceptBookings: {
        type: Boolean,
        default: false,
      },
      instantBooking: {
        type: Boolean,
        default: false,
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
    },

    // Audit Trail
    auditLog: [auditLogSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
vendorSchema.index({ "locationDetails.coordinates": "2dsphere" });
vendorSchema.index({ category: 1, status: 1, "ratings.average": -1 });
vendorSchema.index({ "businessInfo.slug": 1 });
vendorSchema.index({ status: 1, "availability.isAvailable": 1 });
vendorSchema.index({ owner: 1 });
vendorSchema.index({ isFeatured: 1 });
vendorSchema.index({ name: "text", "businessInfo.name": "text", description: "text" });

// Virtual for full name display
vendorSchema.virtual("displayName").get(function () {
  return this.businessInfo?.name || this.name;
});

// Virtual for checking if vendor is currently available
vendorSchema.virtual("isCurrentlyAvailable").get(function () {
  if (this.status !== "active") return false;
  if (!this.availability?.isAvailable && !this.isAvailable) return false;
  if (
    this.availability?.unavailableUntil &&
    new Date() < this.availability.unavailableUntil
  ) {
    return false;
  }
  return true;
});

// Pre-save hook for slug generation
vendorSchema.pre("save", function () {
  // Generate slug from business name if not set
  if (this.isModified("businessInfo.name") && this.businessInfo && !this.businessInfo.slug) {
    const baseName = this.businessInfo.name || this.name;
    this.businessInfo.slug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Sync legacy fields with new structure
  if (this.isModified("businessInfo.name") && this.businessInfo) {
    this.name = this.businessInfo.name;
  }
  if (this.isModified("availability.isAvailable") && this.availability) {
    this.isAvailable = this.availability.isAvailable;
  }
  if (this.isModified("ratings.average") && this.ratings) {
    this.rating = this.ratings.average;
  }
  if (this.isModified("listing.isFeatured") && this.listing) {
    this.isFeatured = this.listing.isFeatured;
  }

  // Track status changes
  if (this.isModified("status")) {
    this.statusChangedAt = new Date();
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this._statusChangedBy,
      reason: this._statusChangeReason,
    });
  }
});

// Method to add audit log entry
vendorSchema.methods.addAuditLog = function (action, field, oldValue, newValue, userId, ipAddress) {
  this.auditLog.push({
    action,
    field,
    oldValue,
    newValue,
    changedBy: userId,
    changedAt: new Date(),
    ipAddress,
  });

  // Keep only last 100 audit entries
  if (this.auditLog.length > 100) {
    this.auditLog = this.auditLog.slice(-100);
  }
};

// Method to update metrics
vendorSchema.methods.updateMetrics = async function (metricUpdates) {
  Object.keys(metricUpdates).forEach((key) => {
    if (this.metrics[key] !== undefined) {
      this.metrics[key] = metricUpdates[key];
    }
  });
  return this.save();
};

// Method to increment profile views
vendorSchema.methods.incrementProfileViews = async function () {
  this.metrics.profileViews = (this.metrics.profileViews || 0) + 1;
  return this.save();
};

// Method to change status
vendorSchema.methods.changeStatus = function (newStatus, userId, reason) {
  const validTransitions = {
    pending_setup: ["active"],
    active: ["suspended", "deactivated", "under_review"],
    suspended: ["active", "deactivated"],
    deactivated: ["active"],
    under_review: ["active", "suspended"],
  };

  if (!(validTransitions[this.status] || []).includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }

  this._statusChangedBy = userId;
  this._statusChangeReason = reason;
  this.status = newStatus;
  this.statusReason = reason;

  return this;
};

// Method to add/update badge
vendorSchema.methods.addBadge = function (badgeType, expiresAt = null) {
  const existingBadgeIndex = this.badges.findIndex((b) => b.type === badgeType);

  if (existingBadgeIndex >= 0) {
    this.badges[existingBadgeIndex].earnedAt = new Date();
    this.badges[existingBadgeIndex].expiresAt = expiresAt;
  } else {
    this.badges.push({
      type: badgeType,
      earnedAt: new Date(),
      expiresAt,
    });
  }

  return this;
};

// Method to remove expired badges
vendorSchema.methods.removeExpiredBadges = function () {
  const now = new Date();
  this.badges = this.badges.filter(
    (badge) => !badge.expiresAt || badge.expiresAt > now
  );
  return this;
};

// Static method to find nearby vendors
vendorSchema.statics.findNearby = async function (coordinates, maxDistance = 50000, filters = {}) {
  const query = {
    status: "active",
    "availability.isAvailable": true,
    "locationDetails.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coordinates, // [lng, lat]
        },
        $maxDistance: maxDistance, // in meters
      },
    },
    ...filters,
  };

  return this.find(query);
};

// Static method to get featured vendors
vendorSchema.statics.getFeatured = async function (limit = 10) {
  return this.find({
    status: "active",
    $or: [{ isFeatured: true }, { "listing.isFeatured": true }],
  })
    .sort({ "listing.priority": -1, "ratings.average": -1 })
    .limit(limit)
    .populate("category", "name slug");
};

module.exports = mongoose.model("Vendor", vendorSchema);
