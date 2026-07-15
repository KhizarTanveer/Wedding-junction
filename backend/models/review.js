const mongoose = require("mongoose");

// Media schema for review images/videos
const mediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: String,
  },
  { _id: false }
);

// Report schema for flagged reviews
const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["spam", "inappropriate", "fake", "offensive", "other"],
      required: true,
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    // References
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ratings
    ratings: {
      overall: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      quality: {
        type: Number,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      punctuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      valueForMoney: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    // Review Content
    content: {
      title: {
        type: String,
        maxlength: 100,
      },
      text: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000,
      },
      pros: [String],
      cons: [String],
    },

    // Media attachments
    media: [mediaSchema],

    // Event details (for context)
    eventDetails: {
      eventType: String,
      eventDate: Date,
      location: String,
    },

    // Review Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "pending",
    },

    // Moderation
    moderation: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewedAt: Date,
      reason: String,
      notes: String,
    },

    // Vendor Response
    response: {
      text: {
        type: String,
        maxlength: 500,
      },
      respondedAt: Date,
    },

    // Helpful votes
    helpful: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    // Reports
    reported: {
      count: {
        type: Number,
        default: 0,
      },
      reasons: [reportSchema],
    },

    // Verified purchase badge
    isVerifiedBooking: {
      type: Boolean,
      default: true,
    },

    // Edit history
    editHistory: [
      {
        editedAt: {
          type: Date,
          default: Date.now,
        },
        previousText: String,
        previousRating: Number,
      },
    ],

    // Visibility
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
reviewSchema.index({ vendor: 1, status: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ booking: 1 }, { unique: true }); // One review per booking
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ "ratings.overall": -1 });

// Virtual for average rating (calculated from all rating categories)
reviewSchema.virtual("averageRating").get(function () {
  const r = this.ratings;
  const validRatings = [
    r.overall,
    r.quality,
    r.communication,
    r.punctuality,
    r.valueForMoney,
  ].filter((rating) => rating != null);

  if (validRatings.length === 0) return 0;
  return validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
});

// Static method to calculate vendor rating summary
reviewSchema.statics.getVendorRatingSummary = async function (vendorId) {
  const result = await this.aggregate([
    {
      $match: {
        vendor: new mongoose.Types.ObjectId(vendorId),
        status: "approved",
        isVisible: true,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$ratings.overall" },
        totalReviews: { $sum: 1 },
        averageQuality: { $avg: "$ratings.quality" },
        averageCommunication: { $avg: "$ratings.communication" },
        averagePunctuality: { $avg: "$ratings.punctuality" },
        averageValue: { $avg: "$ratings.valueForMoney" },
        distribution: {
          $push: "$ratings.overall",
        },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      average: 0,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      breakdown: {
        quality: 0,
        communication: 0,
        punctuality: 0,
        valueForMoney: 0,
      },
    };
  }

  // Calculate distribution
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result[0].distribution.forEach((rating) => {
    const rounded = Math.round(rating);
    if (rounded >= 1 && rounded <= 5) {
      dist[rounded]++;
    }
  });

  return {
    average: Math.round(result[0].averageRating * 10) / 10,
    count: result[0].totalReviews,
    distribution: dist,
    breakdown: {
      quality: Math.round((result[0].averageQuality || 0) * 10) / 10,
      communication: Math.round((result[0].averageCommunication || 0) * 10) / 10,
      punctuality: Math.round((result[0].averagePunctuality || 0) * 10) / 10,
      valueForMoney: Math.round((result[0].averageValue || 0) * 10) / 10,
    },
  };
};

// Static method to update vendor's rating after review changes
reviewSchema.statics.updateVendorRating = async function (vendorId) {
  const Vendor = mongoose.model("Vendor");
  const summary = await this.getVendorRatingSummary(vendorId);

  await Vendor.findByIdAndUpdate(vendorId, {
    "ratings.average": summary.average,
    "ratings.count": summary.count,
    "ratings.distribution": summary.distribution,
  });

  return summary;
};

// Post-save hook to update vendor rating
reviewSchema.post("save", async function () {
  if (this.status === "approved") {
    await this.constructor.updateVendorRating(this.vendor);
  }
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function (userId) {
  const userIdStr = userId.toString();
  const userIndex = this.helpful.users.findIndex(
    (u) => u.toString() === userIdStr
  );

  if (userIndex === -1) {
    // User hasn't marked as helpful yet
    this.helpful.users.push(userId);
    this.helpful.count = this.helpful.users.length;
  } else {
    // User already marked, remove their vote
    this.helpful.users.splice(userIndex, 1);
    this.helpful.count = this.helpful.users.length;
  }

  return this.save();
};

// Method to add vendor response
reviewSchema.methods.addResponse = async function (responseText) {
  this.response = {
    text: responseText,
    respondedAt: new Date(),
  };
  return this.save();
};

// Method to report review
reviewSchema.methods.report = async function (userId, reason, description) {
  const existingReport = this.reported.reasons.find(
    (r) => r.user.toString() === userId.toString()
  );

  if (existingReport) {
    throw new Error("You have already reported this review");
  }

  this.reported.reasons.push({
    user: userId,
    reason,
    description,
  });
  this.reported.count = this.reported.reasons.length;

  // Auto-flag if report count exceeds threshold
  if (this.reported.count >= 3 && this.status !== "flagged") {
    this.status = "flagged";
  }

  return this.save();
};

module.exports = mongoose.model("Review", reviewSchema);
