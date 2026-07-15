const mongoose = require("mongoose");

// All possible booking statuses
const BOOKING_STATUSES = [
  "draft",
  "requested",
  "vendor_accepted",
  "vendor_declined",
  "payment_pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled_by_user",
  "cancelled_by_vendor",
  "refund_pending",
  "refunded",
  "disputed",
  "resolved",
  "expired",
  "closed",
];

// Valid status transitions
const VALID_TRANSITIONS = {
  draft: ["requested"],
  requested: ["vendor_accepted", "vendor_declined", "expired", "cancelled_by_user"],
  vendor_accepted: ["payment_pending", "cancelled_by_user", "cancelled_by_vendor"],
  vendor_declined: ["closed"],
  payment_pending: ["confirmed", "expired", "cancelled_by_user"],
  confirmed: ["in_progress", "cancelled_by_user", "cancelled_by_vendor"],
  in_progress: ["completed", "disputed"],
  completed: ["closed", "disputed"],
  cancelled_by_user: ["refund_pending", "closed"],
  cancelled_by_vendor: ["refund_pending", "closed"],
  refund_pending: ["refunded"],
  refunded: ["closed"],
  disputed: ["resolved"],
  resolved: ["closed"],
  expired: ["closed"],
  closed: [],
};

// Schema for client details
const clientDetailsSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: String,
    email: String,
    eventDate: { type: Date, required: true },
    eventEndDate: Date,
    eventType: String,
    guestCount: Number,
    specialRequests: String,
    address: String,
  },
  { _id: false }
);

// Schema for status history
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: BOOKING_STATUSES,
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
    metadata: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

// Schema for payment transactions
const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["payment", "refund"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    gateway: String,
    paidAt: Date,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { _id: true }
);

// Schema for internal notes
const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

// Schema for reminders
const reminderSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["payment", "event", "review", "custom"],
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    sentAt: Date,
    channel: {
      type: String,
      enum: ["email", "sms", "push"],
    },
  },
  { _id: false }
);

// Schema for documents
const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["contract", "invoice", "receipt", "other"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    // Human-readable booking ID (e.g., WJ-2024-001234)
    bookingId: {
      type: String,
      unique: true,
    },

    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },

    // Vendor reference
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    // Conversation reference (for bookings from chat)
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },

    // Service Details
    service: { type: String, required: true },
    serviceDetails: {
      name: String,
      description: String,
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    },

    // Event Details
    event: {
      type: String,
      date: Date,
      endDate: Date,
      startTime: String,
      endTime: String,
      venue: {
        name: String,
        address: String,
        city: String,
        coordinates: {
          type: { type: String, enum: ["Point"] },
          coordinates: [Number],
        },
      },
      guestCount: Number,
      specialRequests: String,
    },

    // Pricing
    price: { type: Number, required: true },
    originalPrice: Number,
    negotiatedPrice: Number,
    image: String,

    // Enhanced pricing structure
    pricing: {
      originalPrice: Number,
      negotiatedPrice: Number,
      finalPrice: Number,
      currency: {
        type: String,
        default: "INR",
      },
      breakdown: [
        {
          item: String,
          amount: Number,
        },
      ],
      discount: {
        code: String,
        amount: Number,
        percentage: Number,
      },
      taxes: {
        gst: Number,
        serviceFee: Number,
      },
      totalAmount: Number,
    },

    // Payment
    payment: {
      status: {
        type: String,
        enum: ["pending", "partial", "completed", "refunded", "failed"],
        default: "pending",
      },
      method: String,
      transactions: [transactionSchema],
      deposit: {
        required: Boolean,
        amount: Number,
        paidAt: Date,
      },
      balance: {
        amount: Number,
        dueDate: Date,
        paidAt: Date,
      },
    },

    // Booking Status
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "draft",
    },

    // Status History
    statusHistory: [statusHistorySchema],

    // Vendor Response
    vendorAccepted: {
      type: Boolean,
      default: false,
    },
    vendorAcceptedAt: Date,
    vendorResponse: {
      respondedAt: Date,
      accepted: Boolean,
      declineReason: String,
      counterOffer: {
        price: Number,
        message: String,
      },
    },

    // Client details (filled during confirmation)
    clientDetails: {
      type: clientDetailsSchema,
      default: undefined,
    },

    // Legacy field
    isConfirmed: {
      type: Boolean,
      default: false,
    },

    // Cancellation
    cancellation: {
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      cancelledAt: Date,
      reason: String,
      policy: {
        refundPercentage: Number,
        refundAmount: Number,
      },
    },

    // Dispute
    dispute: {
      raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      raisedAt: Date,
      reason: String,
      description: String,
      evidence: [String],
      resolution: {
        resolvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        resolvedAt: Date,
        decision: String,
        refundAmount: Number,
      },
    },

    // Review reference
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    reviewReminder: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: Date,
    },

    // Reminders & Notifications
    reminders: [reminderSchema],

    // Documents
    documents: [documentSchema],

    // Internal Notes
    notes: [noteSchema],

    // Source tracking
    source: {
      type: String,
      enum: ["website", "mobile_app", "chat", "phone", "referral"],
      default: "website",
    },
    referral: {
      code: String,
      referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Expiry for pending bookings
    expiresAt: Date,

    // Completion tracking
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ vendor: 1, status: 1 });
bookingSchema.index({ "event.date": 1 });
bookingSchema.index({ status: 1, expiresAt: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ user: 1, isConfirmed: 1 });

// Virtual for checking if booking can be cancelled
bookingSchema.virtual("canBeCancelled").get(function () {
  const cancellableStatuses = [
    "requested",
    "vendor_accepted",
    "payment_pending",
    "confirmed",
  ];
  return cancellableStatuses.includes(this.status);
});

// Virtual for checking if booking is active
bookingSchema.virtual("isActive").get(function () {
  const activeStatuses = [
    "requested",
    "vendor_accepted",
    "payment_pending",
    "confirmed",
    "in_progress",
  ];
  return activeStatuses.includes(this.status);
});

// Virtual for final price
bookingSchema.virtual("finalPrice").get(function () {
  return (
    this.pricing?.totalAmount ||
    this.pricing?.finalPrice ||
    this.negotiatedPrice ||
    this.price
  );
});

// Pre-save hook for booking ID generation
bookingSchema.pre("save", async function () {
  if (!this.bookingId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
    });
    this.bookingId = `WJ-${year}-${String(count + 1).padStart(6, "0")}`;
  }

  // Track status changes
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this._statusChangedBy,
      reason: this._statusChangeReason,
      notes: this._statusChangeNotes,
      metadata: this._statusChangeMetadata,
    });

    // Update relevant flags based on status
    if (this.status === "confirmed") {
      this.isConfirmed = true;
    }
    if (this.status === "completed") {
      this.completedAt = new Date();
    }
    if (this.status === "vendor_accepted") {
      this.vendorAccepted = true;
      this.vendorAcceptedAt = new Date();
    }
  }
});

// Method to check if status transition is valid
bookingSchema.methods.canTransitionTo = function (newStatus) {
  return (VALID_TRANSITIONS[this.status] || []).includes(newStatus);
};

// Method to transition status
bookingSchema.methods.transitionTo = function (newStatus, userId, options = {}) {
  if (!this.canTransitionTo(newStatus)) {
    throw new Error(
      `Invalid status transition from ${this.status} to ${newStatus}`
    );
  }

  this._statusChangedBy = userId;
  this._statusChangeReason = options.reason;
  this._statusChangeNotes = options.notes;
  this._statusChangeMetadata = options.metadata;
  this.status = newStatus;

  return this;
};

// Method to accept booking (vendor action)
bookingSchema.methods.accept = function (vendorUserId, options = {}) {
  if (this.status !== "requested") {
    throw new Error("Only requested bookings can be accepted");
  }

  this.vendorResponse = {
    respondedAt: new Date(),
    accepted: true,
  };

  // Set expiry for payment (24 hours)
  this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return this.transitionTo("vendor_accepted", vendorUserId, options);
};

// Method to decline booking (vendor action)
bookingSchema.methods.decline = function (vendorUserId, reason, options = {}) {
  if (this.status !== "requested") {
    throw new Error("Only requested bookings can be declined");
  }

  this.vendorResponse = {
    respondedAt: new Date(),
    accepted: false,
    declineReason: reason,
  };

  return this.transitionTo("vendor_declined", vendorUserId, {
    ...options,
    reason,
  });
};

// Method to make counter offer
bookingSchema.methods.counterOffer = function (vendorUserId, price, message) {
  if (this.status !== "requested") {
    throw new Error("Only requested bookings can have counter offers");
  }

  this.vendorResponse = {
    ...this.vendorResponse,
    counterOffer: {
      price,
      message,
    },
  };

  return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = function (userId, isVendor, reason, options = {}) {
  if (!this.canBeCancelled) {
    throw new Error("This booking cannot be cancelled");
  }

  const newStatus = isVendor ? "cancelled_by_vendor" : "cancelled_by_user";

  this.cancellation = {
    cancelledBy: userId,
    cancelledAt: new Date(),
    reason,
    policy: this.calculateRefundPolicy(),
  };

  return this.transitionTo(newStatus, userId, { ...options, reason });
};

// Method to calculate refund policy
bookingSchema.methods.calculateRefundPolicy = function () {
  const eventDate = this.clientDetails?.eventDate || this.event?.date;
  if (!eventDate) {
    return { refundPercentage: 100, refundAmount: this.finalPrice };
  }

  const daysUntilEvent = Math.ceil(
    (new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  let refundPercentage;
  if (daysUntilEvent > 30) {
    refundPercentage = 100;
  } else if (daysUntilEvent > 14) {
    refundPercentage = 75;
  } else if (daysUntilEvent > 7) {
    refundPercentage = 50;
  } else if (daysUntilEvent > 3) {
    refundPercentage = 25;
  } else {
    refundPercentage = 0;
  }

  return {
    refundPercentage,
    refundAmount: (this.finalPrice * refundPercentage) / 100,
  };
};

// Method to raise dispute
bookingSchema.methods.raiseDispute = function (userId, reason, description, evidence = []) {
  if (!["in_progress", "completed"].includes(this.status)) {
    throw new Error("Disputes can only be raised for in-progress or completed bookings");
  }

  this.dispute = {
    raisedBy: userId,
    raisedAt: new Date(),
    reason,
    description,
    evidence,
  };

  return this.transitionTo("disputed", userId, { reason });
};

// Method to resolve dispute
bookingSchema.methods.resolveDispute = function (adminId, decision, refundAmount = 0) {
  if (this.status !== "disputed") {
    throw new Error("Only disputed bookings can be resolved");
  }

  this.dispute.resolution = {
    resolvedBy: adminId,
    resolvedAt: new Date(),
    decision,
    refundAmount,
  };

  return this.transitionTo("resolved", adminId, { reason: decision });
};

// Method to add note
bookingSchema.methods.addNote = function (userId, text, isPrivate = true) {
  this.notes.push({
    text,
    addedBy: userId,
    addedAt: new Date(),
    isPrivate,
  });
  return this;
};

// Method to schedule reminder
bookingSchema.methods.scheduleReminder = function (type, scheduledAt, channel) {
  this.reminders.push({
    type,
    scheduledAt,
    channel,
  });
  return this;
};

// Static method to find expired bookings
bookingSchema.statics.findExpired = async function () {
  return this.find({
    status: { $in: ["requested", "payment_pending"] },
    expiresAt: { $lt: new Date() },
  });
};

// Static method to expire bookings
bookingSchema.statics.expireBookings = async function () {
  const expiredBookings = await this.findExpired();

  for (const booking of expiredBookings) {
    booking.transitionTo("expired", null, {
      reason: "Booking expired due to no response/payment",
    });
    await booking.save();
  }

  return expiredBookings.length;
};

// Static method to get vendor booking stats
bookingSchema.statics.getVendorStats = async function (vendorId) {
  const stats = await this.aggregate([
    { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: {
          $sum: {
            $cond: [
              { $eq: ["$status", "completed"] },
              { $ifNull: ["$pricing.totalAmount", "$price"] },
              0,
            ],
          },
        },
      },
    },
  ]);

  const result = {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  };

  stats.forEach((stat) => {
    result.total += stat.count;
    if (stat._id === "requested" || stat._id === "vendor_accepted" || stat._id === "payment_pending") {
      result.pending += stat.count;
    } else if (stat._id === "confirmed" || stat._id === "in_progress") {
      result.confirmed += stat.count;
    } else if (stat._id === "completed") {
      result.completed += stat.count;
      result.totalRevenue += stat.totalAmount;
    } else if (stat._id === "cancelled_by_user" || stat._id === "cancelled_by_vendor") {
      result.cancelled += stat.count;
    }
  });

  return result;
};

// Export the model and constants
module.exports = mongoose.model("Booking", bookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;
module.exports.VALID_TRANSITIONS = VALID_TRANSITIONS;
