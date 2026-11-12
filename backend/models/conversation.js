const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    
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

    
    status: {
      type: String,
      enum: ["active", "agreed", "booking_created", "closed"],
      default: "active",
    },

    
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

   
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    
    unreadCountUser: {
      type: Number,
      default: 0,
    },
    unreadCountVendor: {
      type: Number,
      default: 0,
    },

   
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


conversationSchema.index({ user: 1, status: 1 });
conversationSchema.index({ vendorUser: 1, status: 1 });
conversationSchema.index({ vendor: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
