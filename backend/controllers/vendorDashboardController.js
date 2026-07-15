const Vendor = require("../models/vendor");
const Booking = require("../models/booking");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const { deleteFromCloudinary } = require("../config/cloudinary");

// GET VENDOR DASHBOARD STATS
const getVendorStats = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    // Get counts
    const [totalBookings, pendingBookings, confirmedBookings, completedBookings] =
      await Promise.all([
        Booking.countDocuments({ vendor: vendorId }),
        Booking.countDocuments({ vendor: vendorId, status: "pending" }),
        Booking.countDocuments({ vendor: vendorId, status: "confirmed" }),
        Booking.countDocuments({ vendor: vendorId, status: "completed" }),
      ]);

    // Get active conversations count
    const activeConversations = await Conversation.countDocuments({
      vendorUser: req.user._id,
      status: { $in: ["active", "agreed"] },
    });

    // Get unread messages count
    const unreadMessages = await Conversation.aggregate([
      { $match: { vendorUser: req.user._id } },
      { $group: { _id: null, total: { $sum: "$unreadCountVendor" } } },
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("userName service price status createdAt vendorAccepted");

    // Get recent conversations
    const recentConversations = await Conversation.find({
      vendorUser: req.user._id,
    })
      .populate("user", "name avatar")
      .populate("lastMessage", "content createdAt")
      .sort({ lastMessageAt: -1 })
      .limit(5);

    // Calculate revenue
    const revenue = await Booking.aggregate([
      {
        $match: {
          vendor: vendorId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
        },
      },
    ]);

    return res.status(200).json({
      status: "success",
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        activeConversations,
        unreadMessages: unreadMessages[0]?.total || 0,
        totalRevenue: revenue[0]?.total || 0,
      },
      recentBookings,
      recentConversations,
    });
  } catch (error) {
    console.error("Get vendor stats error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard stats",
    });
  }
};

// GET VENDOR PROFILE
const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ owner: req.user._id }).populate(
      "category",
      "name"
    );

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    return res.status(200).json({
      status: "success",
      vendor,
    });
  } catch (error) {
    console.error("Get vendor profile error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch vendor profile",
    });
  }
};

// UPDATE VENDOR PROFILE
const updateVendorProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      "name",
      "service",
      "description",
      "details",
      "experience",
      "servicesOffered",
      "price",
      "contact",
      "location",
      "image",
      "isAvailable",
      "pricing",
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const vendor = await Vendor.findOneAndUpdate(
      { owner: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("category", "name");

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    return res.status(200).json({
      status: "success",
      vendor,
    });
  } catch (error) {
    console.error("Update vendor profile error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update vendor profile",
    });
  }
};

// GET VENDOR BOOKINGS
const getVendorBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const vendorId = req.vendor._id;

    // Validate and sanitize pagination parameters
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // Ensure positive values and cap limit
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100); // Cap at 100 items per page

    const query = { vendor: vendorId };
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ]);

    return res.status(200).json({
      status: "success",
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get vendor bookings error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch bookings",
    });
  }
};

// ACCEPT BOOKING
const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    // Verify this booking is for vendor's vendor profile
    if (booking.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to accept this booking",
      });
    }

    if (booking.vendorAccepted) {
      return res.status(400).json({
        status: "error",
        message: "Booking already accepted",
      });
    }

    booking.vendorAccepted = true;
    booking.vendorAcceptedAt = new Date();
    await booking.save();

    // If there's a conversation, send system message
    if (booking.conversation) {
      await Message.create({
        conversation: booking.conversation,
        sender: req.user._id,
        senderRole: "vendor",
        messageType: "system",
        content: "Vendor has accepted your booking request!",
      });

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to(`conversation:${booking.conversation}`).emit("booking_accepted", {
          bookingId: booking._id,
        });
      }
    }

    return res.status(200).json({
      status: "success",
      booking,
    });
  } catch (error) {
    console.error("Accept booking error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to accept booking",
    });
  }
};

// REJECT BOOKING
const rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    // Verify ownership
    if (booking.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to reject this booking",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    // If there's a conversation, send system message
    if (booking.conversation) {
      await Message.create({
        conversation: booking.conversation,
        sender: req.user._id,
        senderRole: "vendor",
        messageType: "system",
        content: reason
          ? `Vendor has declined your booking: ${reason}`
          : "Vendor has declined your booking request.",
      });

      // Update conversation status
      await Conversation.findByIdAndUpdate(booking.conversation, {
        status: "closed",
      });

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to(`conversation:${booking.conversation}`).emit("booking_rejected", {
          bookingId: booking._id,
          reason,
        });
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Booking rejected",
    });
  } catch (error) {
    console.error("Reject booking error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to reject booking",
    });
  }
};

// COMPLETE BOOKING
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    // Verify ownership
    if (booking.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        status: "error",
        message: "Only confirmed bookings can be marked as completed",
      });
    }

    booking.status = "completed";
    await booking.save();

    // Update conversation if exists
    if (booking.conversation) {
      await Conversation.findByIdAndUpdate(booking.conversation, {
        status: "closed",
      });

      await Message.create({
        conversation: booking.conversation,
        sender: req.user._id,
        senderRole: "vendor",
        messageType: "system",
        content: "Booking has been marked as completed. Thank you!",
      });
    }

    return res.status(200).json({
      status: "success",
      booking,
    });
  } catch (error) {
    console.error("Complete booking error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to complete booking",
    });
  }
};

// GET VENDOR CONVERSATIONS
const getVendorConversations = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { vendorUser: req.user._id };
    if (status && status !== "all") {
      query.status = status;
    }

    const conversations = await Conversation.find(query)
      .populate("user", "name avatar email")
      .populate("vendor", "name image")
      .populate("lastMessage", "content messageType createdAt")
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      status: "success",
      conversations,
    });
  } catch (error) {
    console.error("Get vendor conversations error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch conversations",
    });
  }
};

// UPLOAD PROFILE IMAGE
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.uploadedImage) {
      return res.status(400).json({
        status: "error",
        message: "No image file provided",
      });
    }

    const vendor = await Vendor.findOne({ owner: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    // Update vendor image
    vendor.image = req.uploadedImage.url;
    if (vendor.businessInfo) {
      vendor.businessInfo.logo = req.uploadedImage.url;
    }
    await vendor.save();

    return res.status(200).json({
      status: "success",
      message: "Profile image updated",
      image: req.uploadedImage,
    });
  } catch (error) {
    console.error("Upload profile image error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload image",
    });
  }
};

// UPLOAD GALLERY IMAGES
const uploadGalleryImages = async (req, res) => {
  try {
    if (!req.uploadedImages || req.uploadedImages.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No images provided",
      });
    }

    const vendor = await Vendor.findOne({ owner: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    // Add new images to gallery
    const newGalleryImages = req.uploadedImages.map((img, index) => ({
      url: img.url,
      publicId: img.publicId,
      caption: "",
      order: (vendor.businessInfo?.gallery?.length || 0) + index,
    }));

    if (!vendor.businessInfo) {
      vendor.businessInfo = { name: vendor.name, description: vendor.description, gallery: [] };
    }
    if (!vendor.businessInfo.gallery) {
      vendor.businessInfo.gallery = [];
    }

    vendor.businessInfo.gallery.push(...newGalleryImages);
    await vendor.save();

    return res.status(200).json({
      status: "success",
      message: `${req.uploadedImages.length} images uploaded`,
      images: newGalleryImages,
    });
  } catch (error) {
    console.error("Upload gallery images error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload images",
    });
  }
};

// DELETE GALLERY IMAGE
const deleteGalleryImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);

    const vendor = await Vendor.findOne({ owner: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor profile not found",
      });
    }

    // Find and remove image from gallery
    const gallery = vendor.businessInfo?.gallery;
    if (!gallery || gallery.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No gallery images found",
      });
    }

    const imageIndex = gallery.findIndex(
      (img) => img.publicId === decodedPublicId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        status: "error",
        message: "Image not found in gallery",
      });
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(decodedPublicId);
    } catch (cloudinaryError) {
      console.error("Cloudinary delete error:", cloudinaryError);
      // Continue even if Cloudinary delete fails
    }

    // Remove from gallery
    vendor.businessInfo.gallery.splice(imageIndex, 1);
    await vendor.save();

    return res.status(200).json({
      status: "success",
      message: "Image deleted",
    });
  } catch (error) {
    console.error("Delete gallery image error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete image",
    });
  }
};

module.exports = {
  getVendorStats,
  getVendorProfile,
  updateVendorProfile,
  getVendorBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  getVendorConversations,
  uploadProfileImage,
  uploadGalleryImages,
  deleteGalleryImage,
};
