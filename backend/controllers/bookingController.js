const Booking = require("../models/booking");
const Vendor = require("../models/vendor");
const mongoose = require("mongoose");
const { sendBookingConfirmationEmail } = require("../utils/sendEmail");

// CREATE BOOKING
const createBooking = async (req, res) => {
  try {
    const { userName, userEmail, vendorId, service, price, image } = req.body;

    // Validate required fields
    if (!service || !price) {
      return res.status(400).json({
        status: "error",
        message: "Service and price are required",
      });
    }

    // Validate price is a positive number
    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Price must be a positive number",
      });
    }

    // Validate vendorId if provided
    if (vendorId) {
      if (!mongoose.Types.ObjectId.isValid(vendorId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid vendor ID format",
        });
      }

      const vendorExists = await Vendor.exists({ _id: vendorId });
      if (!vendorExists) {
        return res.status(404).json({
          status: "error",
          message: "Vendor not found",
        });
      }
    }

    const booking = await Booking.create({
      user: req.user._id,
      userName: userName || req.user.name,
      userEmail: userEmail || req.user.email,
      vendor: vendorId || null,
      service,
      price,
      image: image || null,
    });

    return res.status(201).json({
      status: "success",
      booking,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Booking failed",
    });
  }
};

// GET USER'S PENDING BOOKINGS
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id, // Only return bookings owned by current user
      isConfirmed: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Cannot fetch bookings",
    });
  }
};

// GET SINGLE BOOKING BY ID (with ownership check)
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    // Validate ownership
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to access this booking",
      });
    }

    return res.status(200).json({
      status: "success",
      booking,
    });
  } catch (error) {
    console.error("Get booking by ID error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Cannot fetch booking",
    });
  }
};

// DELETE BOOKING (with ownership check)
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    // Validate ownership
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this booking",
      });
    }

    await Booking.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      status: "success",
      message: "Booking removed",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Delete failed",
    });
  }
};

// UPDATE BOOKING (with ownership check)
const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    // Validate ownership
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to update this booking",
      });
    }

    // Build update object
    const updateData = {};

    // Handle client details update
    if (req.body.clientDetails) {
      updateData.clientDetails = req.body.clientDetails;
    }

    // Handle status update with transition validation
    if (req.body.status) {
      const validStatuses = [
        "draft", "requested", "vendor_accepted", "vendor_declined",
        "payment_pending", "confirmed", "in_progress", "completed",
        "cancelled_by_user", "cancelled_by_vendor", "refund_pending",
        "refunded", "disputed", "resolved", "expired", "closed"
      ];

      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({
          status: "error",
          message: `Invalid status: ${req.body.status}`,
        });
      }

      // Validate status transition using the model's method
      if (!booking.canTransitionTo(req.body.status)) {
        return res.status(400).json({
          status: "error",
          message: `Invalid status transition from '${booking.status}' to '${req.body.status}'`,
        });
      }

      updateData.status = req.body.status;

      // Update isConfirmed flag if status is confirmed
      if (req.body.status === "confirmed") {
        updateData.isConfirmed = true;
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("vendor", "name businessInfo");

    // Send confirmation email if booking was just confirmed
    if (req.body.status === "confirmed" && updatedBooking) {
      const vendorName = updatedBooking.vendor?.name ||
                         updatedBooking.vendor?.businessInfo?.name ||
                         "Vendor";

      sendBookingConfirmationEmail(booking.userEmail, {
        bookingId: updatedBooking._id.toString(),
        vendorName,
        service: updatedBooking.service,
        price: updatedBooking.price,
        eventDate: updatedBooking.eventDate,
      }).catch((err) => {
        console.error("Failed to send booking confirmation email:", err.message);
      });
    }

    return res.status(200).json({
      status: "success",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Update failed",
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  deleteBooking,
  confirmBooking,
};
