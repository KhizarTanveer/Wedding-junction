const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`User connected: ${socket.user._id} (${socket.user.name})`);

    // Update user online status
    await User.findByIdAndUpdate(socket.user._id, {
      isOnline: true,
      socketId: socket.id,
    });

    // Join user's personal room for direct notifications
    socket.join(`user:${socket.user._id}`);

    // Notify others that user is online
    socket.broadcast.emit("user_online", {
      userId: socket.user._id,
      name: socket.user.name,
    });

    // Join a conversation room
    socket.on("join_conversation", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        // Verify user is a participant or admin
        const isAdmin = socket.user.role === "admin";
        const isParticipant =
          isAdmin ||
          conversation.user.toString() === socket.user._id.toString() ||
          conversation.vendorUser.toString() === socket.user._id.toString();

        if (!isParticipant) {
          socket.emit("error", { message: "Not authorized" });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        socket.emit("joined_conversation", { conversationId });

        console.log(
          `User ${socket.user.name} joined conversation ${conversationId}`
        );
      } catch (error) {
        console.error("Join conversation error:", error);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(
        `User ${socket.user.name} left conversation ${conversationId}`
      );
    });

    // Send a message
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, messageType = "text" } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        // Verify user is a participant or admin
        const isUser =
          conversation.user.toString() === socket.user._id.toString();
        const isVendor =
          conversation.vendorUser.toString() === socket.user._id.toString();
        const isAdmin = socket.user.role === "admin";

        if (!isUser && !isVendor && !isAdmin) {
          socket.emit("error", { message: "Not authorized" });
          return;
        }

        let senderRole;
        if (isAdmin) senderRole = "admin";
        else if (isVendor) senderRole = "vendor";
        else senderRole = "user";

        // Create message
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user._id,
          senderRole,
          content,
          messageType,
          deliveredAt: new Date(),
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

        // Emit to all participants in the conversation
        io.to(`conversation:${conversationId}`).emit("new_message", {
          message,
          conversationId,
        });

        // Also notify the other user if they're not in the conversation room
        const otherUserId = isUser
          ? conversation.vendorUser
          : conversation.user;
        io.to(`user:${otherUserId}`).emit("message_notification", {
          conversationId,
          message,
        });
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicators
    socket.on("typing_start", (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        userId: socket.user._id,
        userName: socket.user.name,
        isTyping: true,
      });
    });

    socket.on("typing_stop", (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        userId: socket.user._id,
        userName: socket.user.name,
        isTyping: false,
      });
    });

    // Mark messages as read
    socket.on("mark_read", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isUser =
          conversation.user.toString() === socket.user._id.toString();
        const isVendor =
          conversation.vendorUser.toString() === socket.user._id.toString();
        const isAdmin = socket.user.role === "admin";

        if (!isUser && !isVendor && !isAdmin) return;

        // Mark messages as read
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

        // Notify other user that messages were read
        socket.to(`conversation:${conversationId}`).emit("messages_read", {
          conversationId,
          readBy: socket.user._id,
        });
      } catch (error) {
        console.error("Mark read error:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user._id}`);

      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: null,
      });

      // Notify others that user is offline
      socket.broadcast.emit("user_offline", {
        userId: socket.user._id,
      });
    });
  });

  return io;
};

module.exports = { initializeSocket };
