const Conversation = require("../models/conversation");
const Message = require("../models/message");
const Vendor = require("../models/vendor");
const Booking = require("../models/booking");

// START A NEW CONVERSATION
const startConversation = async (req, res) => {
  try {
    const { vendorId, service, message } = req.body;

    // Validate vendorId
    if (!vendorId) {
      return res.status(400).json({
        status: "error",
        message: "Vendor ID is required",
      });
    }

    // Find the vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor not found",
      });
    }

    // Check if vendor has an owner
    if (!vendor.owner) {
      return res.status(400).json({
        status: "error",
        message: "This vendor is not available for chat",
      });
    }

    // Get service name - use provided service or fallback to vendor's service
    const serviceName = service || vendor.service;
    if (!serviceName) {
      return res.status(400).json({
        status: "error",
        message: "Service name is required",
      });
    }

    // Use atomic findOneAndUpdate with upsert to prevent race conditions
    // This ensures only one conversation is created even with concurrent requests
    let conversation = await Conversation.findOneAndUpdate(
      {
        user: req.user._id,
        vendor: vendorId,
        "context.service": serviceName,
        status: { $in: ["active", "agreed", "booking_created"] },
      },
      {
        $setOnInsert: {
          user: req.user._id,
          vendor: vendorId,
          vendorUser: vendor.owner,
          context: {
            service: serviceName,
            originalPrice: vendor.price || 0,
          },
          status: "active",
          lastMessageAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Check if this was an existing conversation (no $setOnInsert fields were applied)
    const isExisting = conversation.createdAt < new Date(Date.now() - 1000);

    // If initial message provided and this is a NEW conversation, create the message
    if (message && !isExisting) {
      const newMessage = await Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        senderRole: "user",
        content: message,
        messageType: "text",
      });

      conversation.lastMessage = newMessage._id;
      conversation.unreadCountVendor = 1;
      await conversation.save();
    }

    // Populate vendor details
    await conversation.populate("vendor", "name image service price");

    return res.status(isExisting ? 200 : 201).json({
      status: "success",
      conversation,
      isExisting,
    });
  } catch (error) {
    console.error("Start conversation error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to start conversation",
    });
  }
};

// GET ALL CONVERSATIONS FOR CURRENT USER
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query;
    if (userRole === "vendor") {
      // Vendor sees conversations where they are the vendor and not deleted by vendor
      query = { vendorUser: userId, deletedByVendor: { $ne: true } };
    } else {
      // Regular user (including admin) sees their own conversations not deleted by user
      query = { user: userId, deletedByUser: { $ne: true } };
    }

    const conversations = await Conversation.find(query)
      .populate("vendor", "name image service price")
      .populate("user", "name avatar")
      .populate("lastMessage", "content messageType createdAt")
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      status: "success",
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch conversations",
    });
  }
};

// GET SINGLE CONVERSATION WITH MESSAGES
const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate("vendor", "name image service price contact")
      .populate("user", "name avatar email");

    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found",
      });
    }

    // Verify user is a participant or admin
    const isAdmin = req.user.role === "admin";
    const isParticipant =
      isAdmin ||
      conversation.user._id.toString() === req.user._id.toString() ||
      conversation.vendorUser.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to access this conversation",
      });
    }

    // Get messages with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: req.params.id })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({
      conversation: req.params.id,
    });

    return res.status(200).json({
      status: "success",
      conversation,
      messages: messages.reverse(), // Oldest first
      pagination: {
        page,
        limit,
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit),
      },
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch conversation",
    });
  }
};

// SEND A MESSAGE (REST fallback for when socket is not available)
const sendMessage = async (req, res) => {
  try {
    const { content, messageType = "text" } = req.body;
    const conversationId = req.params.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found",
      });
    }

    // Verify user is a participant or admin
    const isUser = conversation.user.toString() === req.user._id.toString();
    const isVendor =
      conversation.vendorUser.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isUser && !isVendor && !isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to send message in this conversation",
      });
    }

    let senderRole;
    if (isAdmin) senderRole = "admin";
    else if (isVendor) senderRole = "vendor";
    else senderRole = "user";

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      senderRole,
      content,
      messageType,
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    // Update unread count for the other party
    if (senderRole === "user") {
      conversation.unreadCountVendor += 1;
    } else {
      conversation.unreadCountUser += 1;
    }

    await conversation.save();

    // Populate sender info
    await message.populate("sender", "name avatar");

    // Emit socket event if available
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversationId}`).emit("new_message", {
        message,
        conversationId,
      });
    }

    return res.status(201).json({
      status: "success",
      message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to send message",
    });
  }
};

// UPLOAD IMAGE MESSAGE
const uploadImage = async (req, res) => {
  try {
    if (!req.uploadedImage) {
      return res.status(400).json({
        status: "error",
        message: "No image file provided",
      });
    }

    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found",
      });
    }

    // Verify user is a participant or admin
    const isUser = conversation.user.toString() === req.user._id.toString();
    const isVendor =
      conversation.vendorUser.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isUser && !isVendor && !isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized",
      });
    }

    let senderRole;
    if (isAdmin) senderRole = "admin";
    else if (isVendor) senderRole = "vendor";
    else senderRole = "user";

    // Create image message with Cloudinary URL
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      senderRole,
      messageType: "image",
      imageUrl: req.uploadedImage.url,
      content: "Sent an image",
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    if (senderRole === "user") {
      conversation.unreadCountVendor += 1;
    } else {
      conversation.unreadCountUser += 1;
    }
    await conversation.save();

    await message.populate("sender", "name avatar");

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversationId}`).emit("new_message", {
        message,
        conversationId,
      });
    }

    return res.status(201).json({
      status: "success",
      message,
    });
  } catch (error) {
    console.error("Upload image error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload image",
    });
  }
};

// UPDATE AGREED PRICE
const updatePrice = async (req, res) => {
  try {
    const { price } = req.body;
    const conversationId = req.params.id;

    // Validate price is a positive number
    if (typeof price !== "number" || isNaN(price) || price <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Price must be a positive number",
      });
    }

    // Add a reasonable maximum price limit
    const MAX_PRICE = 100000000; // 10 crore
    if (price > MAX_PRICE) {
      return res.status(400).json({
        status: "error",
        message: "Price exceeds maximum allowed limit",
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found",
      });
    }

    // Only vendor can set the agreed price
    const isVendor =
      conversation.vendorUser.toString() === req.user._id.toString();
    if (!isVendor) {
      return res.status(403).json({
        status: "error",
        message: "Only vendor can set the price",
      });
    }

    const previousPrice = conversation.context.agreedPrice;
    conversation.context.agreedPrice = price;
    conversation.status = "agreed";
    await conversation.save();

    // Create system message about price update
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      senderRole: "vendor",
      messageType: "price_update",
      content: `Price updated to Rs. ${Number(price).toLocaleString()}`,
      priceData: {
        amount: price,
        previousAmount: previousPrice,
      },
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    conversation.unreadCountUser += 1;
    await conversation.save();

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversationId}`).emit("price_update", {
        conversationId,
        price,
        previousPrice,
        message,
      });
    }

    return res.status(200).json({
      status: "success",
      conversation,
      message,
    });
  } catch (error) {
    console.error("Update price error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update price",
    });
  }
};

// CREATE BOOKING FROM CHAT
const createBookingFromChat = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId).populate(
      "vendor"
    );

    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found",
      });
    }

    // Only the user can create a booking
    if (conversation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Only the user can create a booking",
      });
    }

    // Check if booking already created from this conversation
    if (conversation.booking) {
      return res.status(400).json({
        status: "error",
        message: "Booking already created from this conversation",
      });
    }

    const finalPrice =
      conversation.context.agreedPrice || conversation.context.originalPrice;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      vendor: conversation.vendor._id,
      conversation: conversationId,
      service: conversation.context.service,
      price: finalPrice,
      originalPrice: conversation.context.originalPrice,
      negotiatedPrice: conversation.context.agreedPrice,
      image: conversation.vendor.image,
      status: "requested",
    });

    // Update conversation
    conversation.booking = booking._id;
    conversation.status = "booking_created";
    await conversation.save();

    // Create system message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      senderRole: "user",
      messageType: "system",
      content: "Booking request created. Waiting for vendor confirmation.",
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    conversation.unreadCountVendor += 1;
    await conversation.save();

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversationId}`).emit("booking_created", {
        conversationId,
        booking,
      });
    }

    return res.status(201).json({
      status: "success",
      booking,
      message,
    });
  } catch (error) {
    console.error("Create booking from chat error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create booking",
    });
  }
};

// MARK MESSAGES AS READ
const markAsRead = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found",
      });
    }

    const isUser = conversation.user.toString() === req.user._id.toString();
    const isVendor =
      conversation.vendorUser.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isUser && !isVendor && !isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized",
      });
    }

    // Mark all unread messages as read
    if (isAdmin) {
      // Admin marks all non-admin messages as read
      await Message.updateMany(
        {
          conversation: conversationId,
          senderRole: { $ne: "admin" },
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        }
      );
      // Reset both unread counts for admin
      conversation.unreadCountUser = 0;
      conversation.unreadCountVendor = 0;
    } else {
      const senderRoleToMark = isUser ? "vendor" : "user";
      await Message.updateMany(
        {
          conversation: conversationId,
          senderRole: senderRoleToMark,
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        }
      );
      // Reset unread count for the current user
      if (isUser) {
        conversation.unreadCountUser = 0;
      } else {
        conversation.unreadCountVendor = 0;
      }
    }
    await conversation.save();

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversationId}`).emit("messages_read", {
        conversationId,
        readBy: req.user._id,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to mark messages as read",
    });
  }
};

// CLOSE CONVERSATION
const closeConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found",
      });
    }

    // Either party or admin can close
    const isAdmin = req.user.role === "admin";
    const isParticipant =
      isAdmin ||
      conversation.user.toString() === req.user._id.toString() ||
      conversation.vendorUser.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized",
      });
    }

    conversation.status = "closed";
    await conversation.save();

    // Create system message
    let senderRole;
    if (isAdmin) senderRole = "admin";
    else if (req.user.role === "vendor") senderRole = "vendor";
    else senderRole = "user";

    await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      senderRole,
      messageType: "system",
      content: "Conversation closed",
    });

    return res.status(200).json({
      status: "success",
      message: "Conversation closed",
    });
  } catch (error) {
    console.error("Close conversation error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to close conversation",
    });
  }
};

// UPDATE MESSAGE - Edit message content (within time window)
const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Message content is required",
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        status: "error",
        message: "Message not found",
      });
    }

    // Verify sender owns the message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You can only edit your own messages",
      });
    }

    // Check if message is already deleted
    if (message.isDeleted) {
      return res.status(400).json({
        status: "error",
        message: "Cannot edit a deleted message",
      });
    }

    // Check if within edit window (15 minutes)
    const editWindowMs = 15 * 60 * 1000;
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    if (messageAge > editWindowMs) {
      return res.status(400).json({
        status: "error",
        message: "Messages can only be edited within 15 minutes of sending",
      });
    }

    // Only text messages can be edited
    if (message.messageType !== "text") {
      return res.status(400).json({
        status: "error",
        message: "Only text messages can be edited",
      });
    }

    // Store original content if first edit
    if (!message.originalContent) {
      message.originalContent = message.content;
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    await message.populate("sender", "name avatar");

    // Emit socket event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${message.conversation}`).emit("message_updated", {
        message,
        conversationId: message.conversation,
      });
    }

    return res.status(200).json({
      status: "success",
      message,
    });
  } catch (error) {
    console.error("Update message error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update message",
    });
  }
};

// DELETE MESSAGE - Soft delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        status: "error",
        message: "Message not found",
      });
    }

    // Verify sender owns the message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You can only delete your own messages",
      });
    }

    // Check if message is already deleted
    if (message.isDeleted) {
      return res.status(400).json({
        status: "error",
        message: "Message already deleted",
      });
    }

    // Soft delete: preserve original content and mark as deleted
    if (!message.originalContent) {
      message.originalContent = message.content;
    }
    message.content = "This message was deleted";
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    await message.populate("sender", "name avatar");

    // Emit socket event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${message.conversation}`).emit("message_deleted", {
        message,
        conversationId: message.conversation,
      });
    }

    return res.status(200).json({
      status: "success",
      message,
    });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete message",
    });
  }
};

// DELETE CONVERSATION (soft delete for current user)
const deleteConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found",
      });
    }

    // Verify user is a participant or admin
    const isUser = conversation.user.toString() === req.user._id.toString();
    const isVendor =
      conversation.vendorUser.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isUser && !isVendor && !isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this conversation",
      });
    }

    // Admin can permanently delete conversations
    if (isAdmin) {
      await Message.deleteMany({ conversation: conversationId });
      await Conversation.findByIdAndDelete(conversationId);
      return res.status(200).json({
        status: "success",
        message: "Conversation permanently deleted by admin",
        permanentlyDeleted: true,
      });
    }

    // Soft delete for the current user
    if (isUser) {
      conversation.deletedByUser = true;
    } else {
      conversation.deletedByVendor = true;
    }

    // If both parties have deleted, remove the conversation and its messages
    if (conversation.deletedByUser && conversation.deletedByVendor) {
      // Delete all messages in this conversation
      await Message.deleteMany({ conversation: conversationId });
      // Delete the conversation itself
      await Conversation.findByIdAndDelete(conversationId);

      return res.status(200).json({
        status: "success",
        message: "Conversation permanently deleted",
        permanentlyDeleted: true,
      });
    }

    // Otherwise just save the soft delete flag
    await conversation.save();

    return res.status(200).json({
      status: "success",
      message: "Conversation deleted",
      permanentlyDeleted: false,
    });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete conversation",
    });
  }
};

module.exports = {
  startConversation,
  getConversations,
  getConversation,
  sendMessage,
  uploadImage,
  updatePrice,
  createBookingFromChat,
  markAsRead,
  closeConversation,
  deleteConversation,
  updateMessage,
  deleteMessage,
};
