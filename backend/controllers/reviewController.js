const Review = require("../models/review");
const Booking = require("../models/booking");
const Vendor = require("../models/vendor");

/**
 * Create a new review
 * POST /api/reviews
 */
const createReview = async (req, res) => {
  try {
    const {
      bookingId,
      ratings,
      content,
      media,
      eventDetails,
    } = req.body;

    // Validate booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate("vendor");

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You can only review your own bookings",
      });
    }

    // Check if booking is completed
    if (booking.status !== "completed" && booking.status !== "closed") {
      return res.status(400).json({
        status: "error",
        message: "You can only review completed bookings",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        status: "error",
        message: "You have already reviewed this booking",
      });
    }

    // Create review
    const review = new Review({
      vendor: booking.vendor._id,
      booking: bookingId,
      reviewer: req.user._id,
      ratings,
      content,
      media: media || [],
      eventDetails: eventDetails || {
        eventType: booking.clientDetails?.eventType,
        eventDate: booking.clientDetails?.eventDate,
        location: booking.clientDetails?.address,
      },
      status: "pending", // Requires moderation
      isVerifiedBooking: true,
    });

    await review.save();

    // Update booking with review reference
    booking.review = review._id;
    await booking.save();

    res.status(201).json({
      status: "success",
      message: "Review submitted successfully and pending approval",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to create review",
    });
  }
};

/**
 * Get reviews for a vendor
 * GET /api/vendors/:vendorId/reviews
 */
const getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt", rating } = req.query;

    const query = {
      vendor: vendorId,
      status: "approved",
      isVisible: true,
    };

    if (rating) {
      query["ratings.overall"] = parseInt(rating);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total, ratingSummary] = await Promise.all([
      Review.find(query)
        .populate("reviewer", "name avatar")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(query),
      Review.getVendorRatingSummary(vendorId),
    ]);

    res.json({
      status: "success",
      data: {
        reviews,
        summary: ratingSummary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get vendor reviews error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reviews",
    });
  }
};

/**
 * Get a single review
 * GET /api/reviews/:id
 */
const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("reviewer", "name avatar")
      .populate("vendor", "name businessInfo.name");

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    res.json({
      status: "success",
      data: review,
    });
  } catch (error) {
    console.error("Get review error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch review",
    });
  }
};

/**
 * Update a review (by reviewer)
 * PUT /api/reviews/:id
 */
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You can only edit your own reviews",
      });
    }

    // Store edit history
    review.editHistory.push({
      editedAt: new Date(),
      previousText: review.content.text,
      previousRating: review.ratings.overall,
    });

    // Update allowed fields
    const { ratings, content } = req.body;

    if (ratings) {
      review.ratings = { ...review.ratings, ...ratings };
    }

    if (content) {
      review.content = { ...review.content, ...content };
    }

    // Reset to pending for re-moderation
    review.status = "pending";

    await review.save();

    res.json({
      status: "success",
      message: "Review updated and pending re-approval",
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update review",
    });
  }
};

/**
 * Delete a review (by reviewer or admin)
 * DELETE /api/reviews/:id
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    const isOwner = review.reviewer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "You can only delete your own reviews",
      });
    }

    // Remove review reference from booking
    await Booking.findByIdAndUpdate(review.booking, {
      $unset: { review: 1 },
    });

    await review.deleteOne();

    // Update vendor rating
    await Review.updateVendorRating(review.vendor);

    res.json({
      status: "success",
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete review",
    });
  }
};

/**
 * Add vendor response to review
 * POST /api/reviews/:id/response
 */
const addResponse = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate("vendor");

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    // Check if user is the vendor owner
    if (review.vendor.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Only the vendor can respond to this review",
      });
    }

    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Response text is required",
      });
    }

    await review.addResponse(text);

    res.json({
      status: "success",
      message: "Response added successfully",
      data: review,
    });
  } catch (error) {
    console.error("Add response error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to add response",
    });
  }
};

/**
 * Mark review as helpful
 * POST /api/reviews/:id/helpful
 */
const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    await review.markHelpful(req.user._id);

    res.json({
      status: "success",
      data: {
        helpfulCount: review.helpful.count,
        isHelpful: review.helpful.users.some(
          (u) => u.toString() === req.user._id.toString()
        ),
      },
    });
  } catch (error) {
    console.error("Mark helpful error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to mark review as helpful",
    });
  }
};

/**
 * Report a review
 * POST /api/reviews/:id/report
 */
const reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    const { reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({
        status: "error",
        message: "Report reason is required",
      });
    }

    await review.report(req.user._id, reason, description);

    res.json({
      status: "success",
      message: "Review reported successfully",
    });
  } catch (error) {
    console.error("Report review error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to report review",
    });
  }
};

/**
 * Moderate a review (admin only)
 * PATCH /api/reviews/:id/moderate
 */
const moderateReview = async (req, res) => {
  try {
    const { status, reason, notes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid moderation status",
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    review.status = status;
    review.moderation = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      reason,
      notes,
    };

    await review.save();

    // Update vendor rating if approved
    if (status === "approved") {
      await Review.updateVendorRating(review.vendor);
    }

    res.json({
      status: "success",
      message: `Review ${status}`,
      data: review,
    });
  } catch (error) {
    console.error("Moderate review error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to moderate review",
    });
  }
};

/**
 * Get pending reviews (admin only)
 * GET /api/admin/reviews/pending
 */
const getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ status: { $in: ["pending", "flagged"] } })
        .populate("reviewer", "name email")
        .populate("vendor", "name businessInfo.name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ status: { $in: ["pending", "flagged"] } }),
    ]);

    res.json({
      status: "success",
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get pending reviews error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch pending reviews",
    });
  }
};

/**
 * Get my reviews
 * GET /api/reviews/my
 */
const getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ reviewer: req.user._id })
        .populate("vendor", "name businessInfo.name image")
        .populate("booking", "service bookingId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ reviewer: req.user._id }),
    ]);

    res.json({
      status: "success",
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reviews",
    });
  }
};

module.exports = {
  createReview,
  getVendorReviews,
  getReview,
  updateReview,
  deleteReview,
  addResponse,
  markHelpful,
  reportReview,
  moderateReview,
  getPendingReviews,
  getMyReviews,
};
