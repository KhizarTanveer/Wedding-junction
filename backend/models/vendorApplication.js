const mongoose = require("mongoose");

// Document schema for verification
const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["id_proof", "business_license", "gst_certificate", "portfolio", "other"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

// Portfolio item schema
const portfolioItemSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    images: [String],
    eventDate: Date,
    eventType: String,
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
    notes: String,
  },
  { _id: false }
);

const vendorApplicationSchema = new mongoose.Schema(
  {
    // Applicant reference
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Business Information
    businessInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
      },
      description: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 2000,
      },
      registrationNumber: String,
      gstNumber: String,
      panNumber: String,
    },

    // Service Details
    serviceDetails: {
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
      subCategories: [String],
      experience: {
        type: Number,
        required: true,
        min: 0,
        max: 50,
      },
      servicesOffered: {
        type: [String],
        required: true,
        validate: {
          validator: function (v) {
            return v && v.length >= 1;
          },
          message: "At least one service must be offered",
        },
      },
      pricing: {
        minPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        maxPrice: {
          type: Number,
          required: true,
        },
        pricingModel: {
          type: String,
          enum: ["fixed", "hourly", "package", "custom"],
          default: "package",
        },
      },
    },

    // Contact Information
    contact: {
      phone: {
        type: String,
        required: true,
      },
      alternatePhone: String,
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
      website: String,
      socialMedia: {
        instagram: String,
        facebook: String,
        youtube: String,
      },
    },

    // Location & Service Areas
    location: {
      address: String,
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: String,
      serviceAreas: {
        type: [String],
        default: [],
      },
    },

    // Documents & Portfolio
    documents: [documentSchema],
    portfolio: [portfolioItemSchema],

    // Application Status
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_review",
        "documents_pending",
        "approved",
        "rejected",
        "suspended",
      ],
      default: "draft",
    },

    // Status History
    statusHistory: [statusHistorySchema],

    // Review Process
    review: {
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      assignedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewedAt: Date,
      reviewNotes: String,
      rejectionReason: String,
      verificationChecklist: {
        businessInfoVerified: {
          type: Boolean,
          default: false,
        },
        contactVerified: {
          type: Boolean,
          default: false,
        },
        documentsVerified: {
          type: Boolean,
          default: false,
        },
        portfolioReviewed: {
          type: Boolean,
          default: false,
        },
      },
    },

    // Reference to created vendor profile (after approval)
    vendorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },

    // Important Dates
    submittedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    expiresAt: Date, // For draft applications

    // Terms acceptance
    termsAccepted: {
      type: Boolean,
      required: true,
    },
    termsAcceptedAt: Date,

    // Application version (for re-applications)
    version: {
      type: Number,
      default: 1,
    },

    // Previous application reference (if re-applying)
    previousApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorApplication",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
vendorApplicationSchema.index({ applicant: 1 });
vendorApplicationSchema.index({ status: 1 });
vendorApplicationSchema.index({ "review.assignedTo": 1 });
vendorApplicationSchema.index({ createdAt: -1 });
vendorApplicationSchema.index({ submittedAt: -1 });

// Virtual for checking if all documents are verified
vendorApplicationSchema.virtual("allDocumentsVerified").get(function () {
  if (!this.documents || this.documents.length === 0) return false;
  return this.documents.every((doc) => doc.verified);
});

// Virtual for checking if checklist is complete
vendorApplicationSchema.virtual("checklistComplete").get(function () {
  if (!this.review || !this.review.verificationChecklist) return false;
  const checklist = this.review.verificationChecklist;
  return (
    checklist.businessInfoVerified &&
    checklist.contactVerified &&
    checklist.documentsVerified &&
    checklist.portfolioReviewed
  );
});

// Pre-save hook to add status change to history
vendorApplicationSchema.pre("save", function () {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this._statusChangedBy, // Set this before saving
      reason: this._statusChangeReason,
      notes: this._statusChangeNotes,
    });

    // Update relevant dates based on status
    if (this.status === "submitted" && !this.submittedAt) {
      this.submittedAt = new Date();
    } else if (this.status === "approved") {
      this.approvedAt = new Date();
    } else if (this.status === "rejected") {
      this.rejectedAt = new Date();
    }
  }
});

// Method to check if application can transition to a new status
vendorApplicationSchema.methods.canTransitionTo = function (newStatus) {
  const validTransitions = {
    draft: ["submitted"],
    submitted: ["under_review", "documents_pending", "rejected"],
    under_review: ["approved", "rejected", "documents_pending"],
    documents_pending: ["under_review", "rejected"],
    approved: ["suspended"],
    rejected: [], // Can create new application instead
    suspended: ["approved"],
  };

  return (validTransitions[this.status] || []).includes(newStatus);
};

// Method to transition status
vendorApplicationSchema.methods.transitionTo = function (
  newStatus,
  userId,
  options = {}
) {
  if (!this.canTransitionTo(newStatus)) {
    throw new Error(
      `Invalid status transition from ${this.status} to ${newStatus}`
    );
  }

  this._statusChangedBy = userId;
  this._statusChangeReason = options.reason;
  this._statusChangeNotes = options.notes;
  this.status = newStatus;

  return this;
};

module.exports = mongoose.model("VendorApplication", vendorApplicationSchema);
