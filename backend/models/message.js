const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "vendor", "admin"],
      required: true,
    },

    // Message content
    content: {
      type: String,
      required: function () {
        return this.messageType === "text" || this.messageType === "system";
      },
      maxlength: 2000,
    },

    // Message type
    messageType: {
      type: String,
      enum: ["text", "image", "price_update", "system"],
      default: "text",
    },

    // For image messages
    imageUrl: {
      type: String,
    },

    // For price update messages
    priceData: {
      amount: {
        type: Number,
      },
      previousAmount: {
        type: Number,
      },
    },

    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },

    // Delivery status
    deliveredAt: {
      type: Date,
    },

    // Edit tracking
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    originalContent: {
      type: String,
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ conversation: 1, isRead: 1 });

module.exports = mongoose.model("Message", messageSchema);
