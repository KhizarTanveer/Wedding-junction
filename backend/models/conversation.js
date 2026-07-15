const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // Participants
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    vendorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Context - what service they're discussing
    context: {
      service: {
        type: String,
        required: true,
      },
      originalPrice: {
        type: Number,
      },
      agreedPrice: {
        type: Number,
      },
      eventDate: {
        type: Date,
      },
      requirements: {
        type: String,
      },
    },

    // Conversation status
    status: {
      type: String,
      enum: ["active", "agreed", "booking_created", "closed"],
      default: "active",
    },

    // Link to booking once created
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    // Last message for preview
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    // Unread counts
    unreadCountUser: {
      type: Number,
      default: 0,
    },
    unreadCountVendor: {
      type: Number,
      default: 0,
    },

    // Soft delete flags
    deletedByUser: {
      type: Boolean,
      default: false,
    },
    deletedByVendor: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
conversationSchema.index({ user: 1, status: 1 });
conversationSchema.index({ vendorUser: 1, status: 1 });
conversationSchema.index({ vendor: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
